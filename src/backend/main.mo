import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // ==== Data Types ====
  type Difficulty = { #easy; #medium; #hard };
  type Status = { #todo; #inProgress; #done };

  public type Task = {
    id : Nat;
    title : Text;
    subject : Text;
    difficulty : Difficulty;
    status : Status;
    createdAt : Time.Time;
    owner : Principal;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  public type UserProfile = {
    owner : Principal;
    language : Text;
    dailyGoal : Nat;
    completedToday : Nat;
    createdAt : Time.Time;
  };

  public type SessionState = {
    inStudyMode : Bool;
    timerSeconds : Nat;
    currentReward : Bool;
  };

  public type QuizQuestion = {
    question : Text;
    answer : Text;
  };

  public type QuizResult = {
    id : Nat;
    topics : [Text];
    questions : [QuizQuestion];
    score : Nat;
    date : Time.Time;
    owner : Principal;
  };

  public type StudyFile = {
    id : Nat;
    title : Text;
    subject : Text;
    fileType : Text;
    uploadedAt : Time.Time;
    blobId : Text;
    owner : Principal;
  };

  public type DashboardSummary = {
    profile : ?UserProfile;
    tasks : [Task];
    session : SessionState;
    lastQuizScore : ?Nat;
  };

  // ==== Persistent State ====
  let userProfiles = Map.empty<Principal, UserProfile>();
  let tasks = Map.empty<Nat, Task>();
  let studyFiles = Map.empty<Nat, StudyFile>();
  let quizResults = Map.empty<Principal, List.List<QuizResult>>();
  let activeQuizzes = Map.empty<Principal, QuizResult>();
  let sessionStates = Map.empty<Principal, SessionState>();
  let subjects = Set.empty<Text>();
  var currentTaskId = 0;
  var currentFileId = 0;
  var currentQuizId = 0;

  // ==== Authorization (Role System) ====
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ==== User Profile Management ====
  public shared ({ caller }) func createOrUpdateUserProfile(language : Text, dailyGoal : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };
    let existingProfile = userProfiles.get(caller);
    let completedToday = switch (existingProfile) {
      case (?profile) { profile.completedToday };
      case null { 0 };
    };
    let profile : UserProfile = {
      owner = caller;
      language;
      dailyGoal;
      completedToday;
      createdAt = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let updatedProfile = {
      owner = caller;
      language = profile.language;
      dailyGoal = profile.dailyGoal;
      completedToday = profile.completedToday;
      createdAt = profile.createdAt;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ==== Task Management ====
  public shared ({ caller }) func createTask(title : Text, subject : Text, difficulty : Difficulty) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    let taskId = currentTaskId;
    let task : Task = {
      title;
      subject;
      difficulty;
      status = #todo;
      createdAt = Time.now();
      owner = caller;
      id = taskId;
    };

    tasks.add(taskId, task);
    currentTaskId += 1;
    subjects.add(subject);
    taskId;
  };

  public shared ({ caller }) func updateTask(taskId : Nat, status : Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task not found");
      };
      case (?task) {
        if (task.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own tasks");
        };
        let updatedTask = {
          id = task.id;
          title = task.title;
          subject = task.subject;
          difficulty = task.difficulty;
          status = status;
          createdAt = task.createdAt;
          owner = task.owner;
        };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    switch (tasks.get(taskId)) {
      case null {
        Runtime.trap("Task not found");
      };
      case (?task) {
        if (task.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own tasks");
        };
        tasks.remove(taskId);
      };
    };
  };

  public query ({ caller }) func getTasksForUser(user : Principal) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };
    let userTasks = tasks.values().toArray().filter(
      func(task : Task) : Bool {
        task.owner == user;
      },
    );
    userTasks;
  };

  // ==== Session Management ====
  public shared ({ caller }) func updateSessionState(state : SessionState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update session state");
    };
    sessionStates.add(caller, state);
  };

  public query ({ caller }) func getSessionState(user : Principal) : async SessionState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view session state");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own session state");
    };
    switch (sessionStates.get(user)) {
      case (?state) { state };
      case null {
        {
          inStudyMode = false;
          timerSeconds = 0;
          currentReward = false;
        };
      };
    };
  };

  // ==== Quiz Management ====
  public shared ({ caller }) func startQuiz(topics : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start quizzes");
    };
    let quizId = currentQuizId;
    let quiz : QuizResult = {
      id = quizId;
      topics = topics;
      questions = [];
      score = 0;
      date = Time.now();
      owner = caller;
    };
    activeQuizzes.add(caller, quiz);
    currentQuizId += 1;
    quizId;
  };

  public query ({ caller }) func getActiveQuiz() : async ?QuizResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view active quizzes");
    };
    activeQuizzes.get(caller);
  };

  public shared ({ caller }) func submitQuiz(quizId : Nat, score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quizzes");
    };
    switch (activeQuizzes.get(caller)) {
      case null {
        Runtime.trap("No active quiz found");
      };
      case (?quiz) {
        if (quiz.id != quizId) {
          Runtime.trap("Quiz ID mismatch");
        };
        let completedQuiz = {
          id = quiz.id;
          topics = quiz.topics;
          questions = quiz.questions;
          score = score;
          date = Time.now();
          owner = caller;
        };
        let history = switch (quizResults.get(caller)) {
          case null { List.empty<QuizResult>() };
          case (?list) { list };
        };
        history.add(completedQuiz);
        quizResults.add(caller, history);
        activeQuizzes.remove(caller);
      };
    };
  };

  public query ({ caller }) func getQuizHistory(user : Principal) : async [QuizResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quiz history");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own quiz history");
    };
    switch (quizResults.get(user)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  // ==== File Management ====
  public shared ({ caller }) func registerStudyFile(title : Text, subject : Text, fileType : Text, blobId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };
    let fileId = currentFileId;
    let studyFile : StudyFile = {
      id = fileId;
      title;
      subject;
      fileType;
      uploadedAt = Time.now();
      blobId;
      owner = caller;
    };

    studyFiles.add(fileId, studyFile);
    currentFileId += 1;
    fileId;
  };

  public query ({ caller }) func getStudyFiles() : async [StudyFile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study files");
    };
    let userFiles = studyFiles.values().toArray().filter(
      func(file : StudyFile) : Bool {
        file.owner == caller;
      },
    );
    userFiles;
  };

  public query ({ caller }) func getStudyFilesBySubject(subject : Text) : async [StudyFile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study files");
    };
    let userFiles = studyFiles.values().toArray().filter(
      func(file : StudyFile) : Bool {
        file.owner == caller and file.subject == subject;
      },
    );
    userFiles;
  };

  public shared ({ caller }) func deleteStudyFile(fileId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete study files");
    };
    switch (studyFiles.get(fileId)) {
      case null {
        Runtime.trap("Study file not found");
      };
      case (?file) {
        if (file.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own study files");
        };
        studyFiles.remove(fileId);
      };
    };
  };

  // ==== Dashboard ====
  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };
    let profile = userProfiles.get(caller);
    let userTasks = tasks.values().toArray().filter(
      func(task : Task) : Bool {
        task.owner == caller;
      },
    );
    let session = switch (sessionStates.get(caller)) {
      case (?state) { state };
      case null {
        {
          inStudyMode = false;
          timerSeconds = 0;
          currentReward = false;
        };
      };
    };
    let lastQuizScore = switch (quizResults.get(caller)) {
      case null { null };
      case (?list) {
        let arr = list.toArray();
        if (arr.size() > 0) {
          ?arr[0].score;
        } else {
          null;
        };
      };
    };
    {
      profile = profile;
      tasks = userTasks;
      session = session;
      lastQuizScore = lastQuizScore;
    };
  };
};

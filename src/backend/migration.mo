import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldUserProfile = {
    owner : Principal;
    language : Text;
    dailyGoal : Nat;
    completedToday : Nat;
    createdAt : Time.Time;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New migrated UserProfile type.
  type NewUserProfile = {
    owner : Principal;
    language : Text;
    dailyGoal : Nat;
    completedToday : Nat;
    createdAt : Time.Time;
  };

  // New actor type
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};

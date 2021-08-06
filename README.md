# ModSquad
ModSquad is a sports team management application that helps coaches and team managers organize and communicate with parents and kids.

## Notes
* A child can have one or more parents 
* A parent can have one or more children
* A parent/child can belong to multiple teams
* A coach can coach multiple teams
* Eventually would want to support a club that has multiple teams

## Queries

### Create team
* Add players/parents to a team
* Get list of players/parents on team

### Create Schedule
* Create schedule of games and practices

### Notify players/parents of upcoming games and events
* Send emails and notifications of upcoming games

## Actors

### Users
Parent(s)
Kids/Players
Coach
Managers
STAR

### Club
A club will have multiple teams in different leaques.

### Team
A team consists of a coach, manager, parents, and players. All of the members of the team will have an assigned role within the team.

_id
Name
Description
League
Season
Members: [
  user: { _id, role: Coach   },   // Or could each user have kids on the team and
  user: { _id, role: Manager },   // model it as a team?
  user: { _id, role: Parent  }
]
Players: [
  {
    _id,
    parentId,
    name,
  },
  ...
]

## Event
An event can be a game, practice, or any other team related activity. It will consist of a title, description, date and time, location (gps), etc... 

## Use Cases
### Create Team
* Coach creates a team and invites the players' parents to join the team.
* Manager/ Parent creates a team and invites the Coach and player's parents to join the team.

## Sign up for team
__Precondition__
* Parent is invited to join the team
__Requirements__
* Parent finds the team
* Parent adds themselves to the team
* Parent adds their child/children to the team
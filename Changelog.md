# Changelog
Note: "*" indicates that the commit link is a placeholder. The corresponding link will be updated in the next commit.


## v0.6.0

### Features
- [``](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Add journey and station deletion handling*
  - When deleting journey, its departure and destination station will erase the record of the journey, using `deleteJourney` in the new `station-service`
  - Station can only be deleted when there are no journeys to or from the station

### Chores

- [``](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Fix the file name of `journeysRouter` unit test*


## v0.5.0

### Features
- [`19d5628`](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Add journey update handling
  - When only updating `duration`, return error
  - When only updating `startTime` or `endTime`, the unspecified time change according to original duration
  - When updating `duration` and one of the time, the unspecified time change according to the updated duration
  - When updating both `startTime` and `endTime`, duration change accordingly
  - When updating all three time fields, perform duration check and update accordingly
  - When changing `departure` and/or `returnID`, station content change accordingly (`journeys`, `departure` or `destination`)

- [`19d5628`](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Add station handling to query by station id `SId`

### Bug Fixes

- [`19d5628`](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Fix `checkToken` expression error

- [`19d5628`](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Fix `auth/quota-exceeded` problem by restricting sign-ins during tests

- [`19d5628`](https://github.com/wangc9/journey-reviewer-backend/commit/19d5628b4c3499983878d5383ad0785d86f8143f) Fix Type error in `Journey` Model



## v0.4.2

### Chores
- [`a41df87`](https://github.com/wangc9/journey-reviewer-backend/commit/a41df87a8e87c0be992a3b1b4611874d1ed02633) Move token checking during all actions with `Journey` and `Station` to a new service `checkToken` in`util-service`


## v0.4.1

### Chores
- [`2d081e8`](https://github.com/wangc9/journey-reviewer-backend/commit/2d081e8c73d57d086685f19d924405e631dd1d32) Move station update during journey creations to a new service `updateStation` in `journey-service`

### Bug Fixes
- [`2d081e8`](https://github.com/wangc9/journey-reviewer-backend/commit/2d081e8c73d57d086685f19d924405e631dd1d32) Change name of return station id `return` in `Journey` Schema to `returnID`


## v0.4.0

### Features
- [`a9a61f4`](https://github.com/wangc9/journey-reviewer-backend/commit/a9a61f41bd1aa2523b7c93fd1aa00cbbe0595bcd) Add journey handling
  - Add `Journey` Schema for journey storage
  - Add `journeysRouter` for journey handling
  - Change `Station` Schema to record arrival and departure journeys, destination count, and departure count

### Bug Fixes

- [`a9a61f4`](https://github.com/wangc9/journey-reviewer-backend/commit/a9a61f41bd1aa2523b7c93fd1aa00cbbe0595bcd) Fix type error
  - Fix type error in `IUser`, `IStation`
  - Add type check for express routers


## v0.3.5

### Bug Fixes

- [`480b190`](https://github.com/wangc9/journey-reviewer-backend/commit/480b19024bc7d2e1434b29e9b859f580746f1f2e) Add error handling for registering station with used SId


## v0.3.4

### Features
- [`3016961`](https://github.com/wangc9/journey-reviewer-backend/commit/3016961fc267910b5230257b3bcc7e0a063c3d39) Stations' information can be changed using `stationsRouter`


## v0.3.3

### Bug Fixes

- [`ec1973f`](https://github.com/wangc9/journey-reviewer-backend/commit/ec1973f4155cb42a9efd0f76edb5e82faba84986) `Stations` list in User now add the newly added station when logged-in user create new station

## v0.3.2

### Features
- [`b68aa78`](https://github.com/wangc9/journey-reviewer-backend/commit/6a586df286e524cd205bb975beeb52d191501b8c) Change condition for triggering `pre_deploy_pipeline`, exclude `#doc` for document maintaince

### Documentation

- [`bed1fc7`](https://github.com/wangc9/journey-reviewer-backend/commit/bed1fc72ef0704427010c3029e63fbef03262efd) Add changelog for all previous versions


## v0.3.1

### Bug Fixes

- [`f9b69b0`](https://github.com/wangc9/journey-reviewer-backend/commit/f9b69b0593027f693df5792dbe37fd179585434a) Move mongoose connection closing to close all user tests


## v0.3.0

### Features
- [`b68aa78`](https://github.com/wangc9/journey-reviewer-backend/commit/b68aa789d308c5ff52e3666968fe68bdcc7d4ea9) Add station handling
  - Add Station Schema for station information storage
  - Add `stationsRouter` for station handling


## v0.2.1

### Bug Fixes

- [`62b5ec3`](https://github.com/wangc9/journey-reviewer-backend/commit/62b5ec3799ea010671c51d6519d56b3be204cdcb) Minor fixes
  - Type User Schema
  - Disable logging `uid` during login


## v0.2.0

### Features
- [`4258177`](https://github.com/wangc9/journey-reviewer-backend/commit/42581778fb4ff00561c41906e61ef3cc1cb24fd8) Add user handling
  - Add Firebase for token generation and authentication
  - Change User Schema for `uid` storage
  - Refactor `userRouter` for user related route handling
  - Add `loginRouter` for login handling

### Bug Fixes

- [`4258177`](https://github.com/wangc9/journey-reviewer-backend/commit/42581778fb4ff00561c41906e61ef3cc1cb24fd8) Fix dummy tests

### Documentation

- [`4258177`](https://github.com/wangc9/journey-reviewer-backend/commit/42581778fb4ff00561c41906e61ef3cc1cb24fd8) Add Firebase to README


## v0.1.0

### Features
- [`d9c4e09`](https://github.com/wangc9/journey-reviewer-backend/commit/d9c4e09d17c72df5f590c948496c0fb9d72145b7) Add User Schema
- [`0705c63`](https://github.com/wangc9/journey-reviewer-backend/commit/0705c6300156077a803a9dd79b92d1c52526133a) Add eslint to CI pipeline

### Bug Fixes

- [`bce2476`](https://github.com/wangc9/journey-reviewer-backend/commit/bce2476bf6838014bc07f79709285cb7f3b43a7d) Add MongoDB secret
- [`895d843`](https://github.com/wangc9/journey-reviewer-backend/commit/895d84312152f2eecb14d268a80d74dfa04f8331) Change GitHub permission


## v0.0.1

### Features
- [`99a596b`](https://github.com/wangc9/journey-reviewer-backend/commit/99a596bf7d202c3ab141a6a6d623ecd60759697d) Setup project to use Node.js, Express, and TypeScript
- [`45ef792`](https://github.com/wangc9/journey-reviewer-backend/commit/45ef7925823f92f884c82433afc9ec604d86bf76) Setup MongoDB
- [`349aa0a`](https://github.com/wangc9/journey-reviewer-backend/commit/349aa0a782152d3d0a80bfbb907a8d99493f9365) Setup Jest
- [`ae2be66`](https://github.com/wangc9/journey-reviewer-backend/commit/ae2be66515c3b3c8fbb69073ef58cdf0a43b9ad8) Setup Prettier
- [`ab06626`](https://github.com/wangc9/journey-reviewer-backend/commit/ab0662653337f33b75165d671613f1638221d1e1) Setup Eslint

### Documentation

- [`99a596b`](https://github.com/wangc9/journey-reviewer-backend/commit/99a596bf7d202c3ab141a6a6d623ecd60759697d) Add initial description of the project
- [`12cf043`](https://github.com/wangc9/journey-reviewer-backend/commit/12cf0435af055006ce929d741434ee41cb974598) Add changelog and timesheet
- [`ab06626`](https://github.com/wangc9/journey-reviewer-backend/commit/ab0662653337f33b75165d671613f1638221d1e1) Add Eslint badge
- [`49f82ec`](https://github.com/wangc9/journey-reviewer-backend/commit/49f82ecd46aaaf592926f7ab9f22895a4be4107a) Link changelog to specific commits

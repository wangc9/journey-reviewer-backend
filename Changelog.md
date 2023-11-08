# Changelog

## v0.3.2

### Features
- [`b68aa78`](https://github.com/wangc9/journey-reviewer-backend/commit/6a586df286e524cd205bb975beeb52d191501b8c) Change condition for triggering `pre_deploy_pipeline`, exclude `#doc` for document maintaince

### Documentation

- [``](https://github.com/wangc9/journey-reviewer-backend/commit/42581778fb4ff00561c41906e61ef3cc1cb24fd8) Add changelog for all previous versions


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

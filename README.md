<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/wangc9/journey-reviewer-backend">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Journey Reviewer</h3>

  <p align="center">
    Review the past journeys made by shared bike in the HSL region
    <br />
    <a href="https://github.com/wangc9/journey-reviewer-backend"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/github_username/repo_name">View Demo</a>
    ·
    <a href="https://github.com/wangc9/journey-reviewer-backend/issues">Report Bug</a>
    ·
    <a href="https://github.com/wangc9/journey-reviewer-backend/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This is the backend implementation of the journey reviewer web.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Node][Node.js]][Node-url]
* [![MongoDB][MongoDB]][MongoDB-url]
* [![Express][Express.js]][Express-url]
* [![Firebase][Firebase]][Firebase-url]
* [![Eslint][Eslint]][Eslint-url]
* [![Prettier][Prettier]][Prettier-url]
* [![Jest][Jest]][Jest-url]

[//]: # (* [![Svelte][Svelte.dev]][Svelte-url])

[//]: # (* [![Laravel][Laravel.com]][Laravel-url])

[//]: # (* [![Bootstrap][Bootstrap.com]][Bootstrap-url])

[//]: # (* [![JQuery][JQuery.com]][JQuery-url])

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This backend is going to be deployed online. However, you could still clone the project and try it locally.

### Prerequisites

In order to run this project locally, Node.js is needed. If you haven't installed it on your own device previously, have a look at the offical website https://nodejs.org/en/download and install it first

To build the backend on your own device, first clone this project into your device
```sh
git clone https://github.com/wangc9/journey-reviewer-backend.git
```

### Installation

1. At the root directory, install all the dependencies used in this project
   ```sh
   npm install
   ```

2. This backend connects to a MongoDB database for retriving data.
Create a `.env` file in the root directory and define the connection
url to the database `MONGODB_URL=`. For security reasons, the url is
not published in the repo. Please contact the <a href="#contact">author</a> for futher
information.

3. Run the project with
   ```sh
   npm start
   ```
4. This project follows the Test-driven Development ([TDD](http://www.butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)) practice.
To run all the tests for this project, use
   ```sh
   npm run test
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [ ] Manually adding stations
- [ ] Drag and drop data files

See the [open issues](https://github.com/github_username/repo_name/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Chen Wang - [@twitter_handle](https://twitter.com/twitter_handle) - [wang.756090@gmail.com](wang.756090@gmail.com)

Project Link: [https://github.com/wangc9/journey-reviewer-backend](https://github.com/wangc9/journey-reviewer-backend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/wangc9/journey-reviewer-backend.svg?style=for-the-badge
[contributors-url]: https://github.com/wangc9/journey-reviewer-backend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/wangc9/journey-reviewer-backend.svg?style=for-the-badge
[forks-url]: https://github.com/wangc9/journey-reviewer-backend/network/members
[stars-shield]: https://img.shields.io/github/stars/wangc9/journey-reviewer-backend.svg?style=for-the-badge
[stars-url]: https://github.com/wangc9/journey-reviewer-backend/stargazers
[issues-shield]: https://img.shields.io/github/issues/wangc9/journey-reviewer-backend.svg?style=for-the-badge
[issues-url]: https://github.com/wangc9/journey-reviewer-backend/issues
[license-shield]: https://img.shields.io/github/license/wangc9/journey-reviewer-backend.svg?style=for-the-badge
[license-url]: https://github.com/wangc9/journey-reviewer-backend/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/chen-w-228a3820b
[product-screenshot]: images/screenshot.png
[Node.js]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/en
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[MongoDB]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/
[Express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/
[Firebase]: https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase
[Firebase-url]: https://firebase.google.com/
[Eslint]: https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white
[Eslint-url]: https://eslint.org/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
[Prettier]: https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E
[Prettier-url]: https://prettier.io/
[Jest]: https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white
[Jest-url]: https://jestjs.io/

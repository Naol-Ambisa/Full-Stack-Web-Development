# Naol Takele — Developer Portfolio

A responsive, accessible portfolio built with HTML, CSS, and vanilla JavaScript. It has no build step or framework.

## Features

- Home, about, skills, projects, resume, and contact sections
- Responsive navigation with an accessible mobile menu
- Dark and light themes, with the selected theme saved in local storage
- Project cards with category filters
- Contact form validation and optional form-service delivery
- Reduced-motion support and scroll-based reveal effects

## Project structure

```text
Personal-Portfolio/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
├── .vscode/
│   └── settings.json
├── assets/
│   ├── icons/
│   │   └── favicon.svg
│   └── images/
│       ├── profile.jpg
│       ├── project-1.svg
│       ├── project-2.svg
│       ├── project-3.svg
│       ├── project-bmi-calculator-website.jpg
│       ├── project-music-player.jpg
│       └── project-personal-portfolio.jpg
└── resume/
    └── Naol-Takele-CV.pdf
```

## Run locally

Open `index.html` in a browser, or serve the folder with a local static-file server such as the VS Code Live Server extension.

## Customize

- **Portfolio text and sections:** edit `index.html`.
- **Colors, layout, and responsive styles:** edit the custom properties at the top of `style.css`.
- **Contact details and project cards:** edit `CONFIG` and `PROJECTS` in `script.js`.
- **Skill meters:** update the displayed percentage, `aria-valuenow`, and the matching `--w` value in `index.html`.
- **Profile photo:** replace `assets/images/profile.jpg` with a square image.
- **Project images:** replace the images in `assets/images/` or update the `image` values in `PROJECTS`.
- **Resume:** replace `resume/Naol-Takele-CV.pdf` with the updated PDF using the same filename.

Project links are intentionally disabled until a real `liveUrl` or `repoUrl` is added for the corresponding project.

## Contact form delivery

The contact form validates its fields in the browser. By default, it does not send messages; it tells the visitor that delivery has not been configured.

To enable delivery with Formspree:

1. Create a form at [formspree.io](https://formspree.io/) and copy its endpoint.
2. Set `formEndpoint` in `CONFIG` in `script.js` to that URL.

The form reports success only when the endpoint returns a successful HTTP response. A static site needs a form provider or a backend service to deliver messages.

## Deployment

This is a static site and can be deployed without a build command. For GitHub Pages, select the repository's root folder as the publishing source. On Netlify or Vercel, use the repository root as the publish/output directory and leave the build command empty.

## Before launch

- Confirm the email address and phone number in `CONFIG`.
- Confirm the GitHub and LinkedIn usernames in `CONFIG`.
- Add real project demo and repository URLs where available.
- Configure `formEndpoint` if the contact form should deliver messages.
- Add the deployed site's URL and a suitable social-sharing image to the Open Graph metadata in `index.html`.

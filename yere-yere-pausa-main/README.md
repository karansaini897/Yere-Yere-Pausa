# Yere Yere Pausa

Build the foundation of a responsive web application called **Yere Yere Pausa**.

**Project purpose:** An urban monsoon waterlogging early-warning and risk-mapping platform that helps people understand local waterlogging risk and plan safer journeys.

**Branding**
- App name: Yere Yere Pausa
- Main tagline: “Know the risk. Plan ahead. Stay safe.”
- Secondary tagline: “पाऊस येण्याआधी, तयारी आपल्या हाती.”
- Create a polished, modern, trustworthy dashboard suitable for a college hackathon project.
- Use a warm-and-cool visual identity: soft cream backgrounds, deep navy text, teal accents, rain blue, and amber/orange for warnings.
- Support both light and dark modes, with a visible toggle. Persist the selected theme.

**Technology**
- Use the project's existing framework if already configured.
- Otherwise use React, TypeScript, Tailwind CSS, shadcn/ui, and Lucide icons.
- Use React Router if appropriate.
- Keep components reusable and the code organized.
- Do not add paid APIs or unnecessary dependencies.

**Application layout**
Create a responsive desktop sidebar and a mobile-friendly navigation menu. Include these sections:
1. Overview
2. Risk Map
3. Safer Trip Planner
4. Neighbourhood Alerts
5. Rain Timeline
6. Community Board
7. Response Dashboard

The navigation should work, and each section should have its own page or clearly separated view. Do not create dead buttons.

**Overview dashboard**
Design a visually impressive home dashboard containing:
- Greeting and current selected location, defaulting to Pune, Maharashtra.
- Summary cards for current risk, rainfall, active community reports, and high-risk locations.
- A prominent waterlogging risk map preview or map placeholder.
- Forecast horizon controls for Now, +1 hour, +3 hours, and +6 hours.
- A list of at-risk areas with risk labels.
- A recent community reports section.
- A clear “View Risk Map” action.

**Design requirements**
- Use attractive cards, clear typography, subtle borders, rounded corners, and consistent spacing.
- Make the interface feel like a real public-safety product, not a generic admin template.
- Use responsive layouts for desktop, tablet, and mobile.
- Add useful loading, empty, and error states where appropriate.
- Use accessible contrast and visible focus states.
- Display a small “Demo data” indicator anywhere simulated information is shown.

**Data and safety**
- Use clearly labelled mock data for now. Never pretend the app has access to live rainfall sensors, official warnings, or a trained forecasting model unless these are actually connected.
- Show timestamps for simulated readings where appropriate.
- Do not claim any route is guaranteed safe.
- Do not build a backend yet; focus on a functional frontend foundation.

**Scope control**
For this step, implement only the app shell, navigation, theme switching, overview dashboard, reusable UI components, and mock data structure. Create the other page routes as simple placeholders so they can be completed in later steps.

Do not rebuild the app or replace the existing project if it already exists. Focus on completing this step cleanly and make sure the app runs before finishing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f81efdd-5b38-4a57-ae6c-c9bdbb8947d8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

The project structure is as follows:

```
/app
  /Components
    /DashboardImage
      DashboardImage.tsx
    /Hero Section
      Hero.tsx
    /LatestMatches
      LatestMatches.tsx
      MatchCard.tsx
  /dashboard
    page.tsx
  /firstpage
    page.tsx
  /login
    page.tsx
  /matchdetails
    page.tsx
  /profile
    page.tsx
  /register
    page.tsx
  /trial
    page.tsx
  layout.tsx
  globals.css
  page.tsx
/public
  /images
  /models
  next.svg
  vercel.svg
  window.svg
  globe.svg
  file.svg
/components
  /ui
    alert.tsx
    button.tsx
    input.tsx
    label.tsx
/lib
  utils.ts
/hooks
  useAuth.ts
  useFetch.ts
  useLocalStorage.ts
  useTheme.ts
```

### Key Components

- **DashboardImage**: Displays an image on the dashboard.
- **Hero**: The hero section of the landing page.
- **LatestMatches**: Displays the latest football matches.
- **MatchCard**: A card component to display match details.

### Usage Instructions

1. Clone the repository.
2. Install dependencies using `npm install` or `yarn install`.
3. Run the development server using `npm run dev` or `yarn dev`.
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing Guidelines

We welcome contributions! Please follow these guidelines:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## Code of Conduct

Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md) in all your interactions with the project.

## Dependencies

- **@heroicons/react**: Icons for React.
- **@radix-ui/react-label**: Label component for Radix UI.
- **@radix-ui/react-slot**: Slot component for Radix UI.
- **@react-three/drei**: Helper components for react-three-fiber.
- **@react-three/fiber**: React renderer for three.js.
- **class-variance-authority**: Utility for managing class names.
- **clsx**: Utility for constructing `className` strings.
- **lucide-react**: Icon library for React.
- **next**: The Next.js framework.
- **react**: React library.
- **react-dom**: React DOM library.
- **tailwind-merge**: Utility for merging Tailwind CSS classes.
- **three**: JavaScript 3D library.

## Deployment Steps

1. Build the project using `npm run build` or `yarn build`.
2. Start the server using `npm start` or `yarn start`.
3. Deploy the project to Vercel or any other hosting platform.

## Environment Setup

1. Create a `.env` file in the root directory.
2. Add your environment variables to the `.env` file.

## Screenshots

![Screenshot 1](public/images/screenshot1.png)
![Screenshot 2](public/images/screenshot2.png)

## FAQs

### How do I run the project?

Follow the instructions in the "Getting Started" section.

### How do I contribute?

Follow the instructions in the "Contributing Guidelines" section.

### How do I deploy the project?

Follow the instructions in the "Deployment Steps" section.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

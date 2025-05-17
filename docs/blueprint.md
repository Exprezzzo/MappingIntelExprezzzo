# **App Name**: Exprezzzo Auth

## Core Features:

- Authentication Providers: Enable user sign-in using Email/Password, Google, Apple, and Phone Number.
- New User Creation: Automatically create a corresponding user profile document in Cloud Firestore when a new Firebase Auth user is created.
- User Deletion Handling: When a Firebase Auth user is deleted, the corresponding user profile document in Firestore will be marked as inactive.
- Profile Settings: User settings include options for setting preferred airport, notification preferences (email, push, sms), and value-based filters

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to convey trust and security in managing user data. It reflects reliability and professionalism.
- Background color: Light Gray (#F5F5F5) provides a neutral backdrop that ensures readability and reduces visual fatigue, making the interface comfortable for prolonged use.
- Accent color: Subtle Indigo (#5C6BC0) will be used for interactive elements like buttons and links, offering a gentle contrast that guides the user without overwhelming the visual hierarchy.
- Clean and modern typography that ensures readability across different devices and screen sizes.
- Use of simple, consistent icons to represent different authentication methods and profile settings, enhancing user understanding and interaction.
- Clear and intuitive layout with a focus on ease of navigation. User profile information is logically grouped for quick access and modification.
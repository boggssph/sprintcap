# quickstart.md

1. Ensure environment variables are set:
   - NEXTAUTH_URL (e.g., http://localhost:3000)
   - NEXTAUTH_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - DATABASE_URL (Postgres)

2. Run database migrations: `npx prisma migrate dev`
3. Start the app: `npm run dev`
4. Open `http://localhost:3000/setup/scrum-master` and click "Continue with Google".
5. For first bootstrap: the first successful sign-in will auto-create the ADMIN user.

# Scorezorg

**A modern sports league management platform built with Next.js and Nx**

Scorezorg is a comprehensive web application for managing sports leagues, tournaments, and player statistics. Built with modern technologies and designed for scalability, it provides league administrators and players with powerful tools to organize competitions and track performance.

## Features

- 🏆 **League Management**: Create and manage multiple sports leagues
- 👥 **Player Management**: Track player profiles, statistics, and performance
- 🎯 **Tournament Brackets**: Organize and visualize tournament structures
- 📊 **Season Tracking**: Monitor season progress and standings
- 🔒 **Admin Controls**: Secure administrative features for league management
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔄 **Real-time Updates**: Live score updates and bracket progression

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Build System**: Nx monorepo
- **Testing**: Jest + Playwright
- **Deployment**: Docker with production optimizations

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eflynch/scorezorg.git
cd scorezorg
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
```bash
# Run the database setup script (macOS)
cd apps/scorezorg && ./setup-db.sh

# Or manually create the database and run schema
createdb scorezorg
psql scorezorg < apps/scorezorg/database/schema.sql
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Deployment

Build for production:
```bash
npm run deploy:build
```

Deploy with Docker:
```bash
npm run docker:build
npm run docker:run
```

```sh
npx nx g @nx/next:app demo
```

To generate a new library, use:

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run with Docker Compose
- `npm run docker:stop` - Stop Docker containers

### Project Structure

```
apps/scorezorg/          # Main Next.js application
├── src/app/            # App router pages and API routes
├── src/components/     # Reusable UI components
├── src/hooks/          # Custom React hooks
├── src/lib/           # Utility libraries
└── public/            # Static assets

apps/scorezorg-e2e/     # End-to-end tests
```

### Database Schema

The application uses PostgreSQL with a flexible JSONB-based schema:
- **Leagues table**: Stores league configuration and data in JSONB format
- **Extensible design**: Ready for additional tables for players, matches, and tournaments
- **Setup scripts**: Automated database setup for development

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/health`

---

Built with ❤️ using Next.js and Nx

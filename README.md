# LavaCar
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/GeovaneMT/LavaCar)

LavaCar is a comprehensive car wash management system (ERP) built with NestJS, following the principles of Domain-Driven Design (DDD) and Clean Architecture. It provides a robust backend for managing customers, vehicles, service breakdowns, and notifications, with a sophisticated role-based access control system.

## About The Project

This repository contains the backend source code for the LavaCar application. It is architected to be scalable, maintainable, and testable by separating business logic from infrastructure concerns.

### Key Features

*   **User Management**: Register and manage `Admin` and `Customer` roles.
*   **Vehicle Management**: CRUD operations for customer vehicles, including details like model, year, and plate.
*   **Breakdown Tracking**: Log and manage vehicle breakdowns, with the ability to upload and associate multiple attachments (images, documents).
*   **Event-Driven Notifications**: A decoupled notification system that can react to domain events, such as sending a notification to a customer when a new breakdown is registered for their vehicle.
*   **Secure Authentication & Authorization**: JWT-based authentication and a granular, role-based permission system powered by CASL.
*   **Declarative Validation**: Uses Zod for validating all incoming data, entities, and value objects, ensuring data integrity.
*   **File Uploads**: Handles multipart/form-data for uploading attachments to a storage provider.

## Architecture

The project is structured using Domain-Driven Design (DDD) principles to create a clean separation of concerns.

*   `core`: Contains the fundamental building blocks of the application, such as the `Entity`, `ValueObject`, `AggregateRoot` base classes, and domain event management.
*   `domain`: This layer holds the core business logic, divided into distinct sub-domains (bounded contexts).
    *   **`erp`**: The main Enterprise Resource Planning domain. It contains the logic for managing customers, vehicles, and breakdowns.
        *   `application`: Defines use cases, repository interfaces (ports), and authorization rules (CASL).
        *   `enterprise`: Contains the core business entities, aggregates, and value objects (e.g., `Customer`, `Vehicle`, `Plate`, `Email`).
    *   **`notification`**: A separate domain responsible for handling all notification-related logic.
        *   `application`: Includes use cases for sending and reading notifications, and subscribers that listen to events from other domains (e.g., `OnVehicleBreakdownCreated`).
        *   `enterprise`: Defines the `Notification` entity.
*   `infra`: This layer would contain the concrete implementations of the repository interfaces, database models, and other framework-specific configurations (e.g., NestJS modules).

### Core Concepts

*   **Domain-Driven Design (DDD)**: The application is centered around the business domain, with a rich model composed of Entities, Value Objects, and Aggregates.
*   **Use Cases**: Each business operation is encapsulated in a use case class (e.g., `CreateCustomerVehicleUseCase`), making the application's functionality explicit and testable in isolation.
*   **Repositories (Ports & Adapters)**: Abstract repository interfaces are defined in the `domain` layer (ports), with concrete implementations intended for the `infra` layer (adapters). This decouples the business logic from the database technology.
*   **Authorization with CASL**: Permissions are defined declaratively based on user roles (`ADMIN`, `CUSTOMER`). The `CaslErpPolicyService` and `CaslNotificationPolicyService` are used to enforce these rules within the use cases, ensuring that users can only perform actions they are authorized for.
*   **Domain Events**: Used for communication between different domains in a loosely coupled manner. For example, when a `VehicleBreakdown` is created in the ERP domain, it dispatches a `VehicleBreakdownCreatedEvent`. The `notification` domain subscribes to this event to trigger a `SendNotificationUseCase`.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or newer)
*   A Node.js package manager (npm, yarn, or pnpm)

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/geovanemt/lavacar.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd lavacar
    ```
3.  Install dependencies:
    ```sh
    npm install
    ```
4.  Set up your environment variables by creating a `.env` file at the root of the project. This file will contain database connection strings, JWT secrets, and other configuration details.

### Running the Application

*   **Development mode:**
    ```sh
    npm run start:dev
    ```

*   **Production mode:**
    ```sh
    npmrun start
    ```

### Running Tests

The project is extensively tested with unit and integration tests.

```sh
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## License

This project is licensed under the CC0 1.0 Universal License. See the `LICENSE` file for more information.
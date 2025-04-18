# CinemUp

## Run

To run the web application:

```bash
cd .\src\CinemUp.API\
dotnet run
```
Navigate to https://localhost:7049.

### Migrations
If you want to add new migration run command below
```bash
dotnet ef migrations add --project src\CinemUp.Infrastructure\CinemUp.Infrastructure.csproj --startup-project src\CinemUp.API\CinemUp.API.csproj --context CinemUp.Infrastructure.Data.DataContext --configuration Debug <Migration name> --output-dir Data\Migrations
```

## Overview

### CinemUp.Core

The **CinemUp.Core** project represents the Domain Layer and contains enterprise or domain logic and includes entities, enums, exceptions, interfaces, types and logic specific to the domain layer. This layer has no dependencies on anything external.

### CinemUp.Infrastructure

The **CinemUp.Infrastructure** project represents Data Access Layer it responsible for interacting with the database. It abstracts the underlying database operations, providing a clean interface for the Business Logic Layer to access and manipulate data.

### CinemUp.API

The **CinemUp.API** project represents Business Logic Layer. It is responsible for interacting with the database. It abstracts the underlying database operations, providing a clean interface for the Business Logic Layer to access and manipulate data. This layer does not directly interact with the database.

### CinemUp.Client

The **CinemUp.Client** project represents Presentation Layer. It is the user interface of the application. 

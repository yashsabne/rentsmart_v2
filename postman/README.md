# RentSmart Postman Collection

## Import

1. Import `RentSmart_API.postman_collection.json`
2. Import `RentSmart_Local.postman_environment.json`
3. Select the environment.
4. Run **Register** or **Login**.
5. JWT token is automatically saved to the environment.

## Services

- Auth Service
- Property Service
- Payment Service
- Chat Service
- Activity Service
- Redis Internal Service

## Authentication

Most protected APIs require

Authorization: Bearer {{token}}

The token is automatically populated after Login/Register.
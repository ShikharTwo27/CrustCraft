# CrustCraft - System Diagrams

This document contains the visual systems diagrams for the CrustCraft pizza customization and inventory-locking platform. You can render these diagrams directly in any markdown viewer supporting Mermaid.js (e.g., GitHub, VS Code preview).

---

## 1. Use Case Diagram

The use case diagram illustrates how customers and system administrators interact with the CrustCraft platform features.

```mermaid
graph TD
    %% Actors
    Customer((Customer))
    Admin((Administrator))

    %% Use Cases
    UC_Register(Register & Verify Email)
    UC_Login(Login & Auth Session)
    UC_Custom(Customize Pizza via Visual Builder)
    UC_Cart(Manage Cart Items)
    UC_Checkout(Place Order with Real-Time Stock Check)
    UC_Pay(Complete Razorpay Payment & Lock Inventory)
    UC_Track(Track Live Order Status via WebSockets)
    
    UC_ManageStock(Track & Update Raw Stock Balances)
    UC_StatusUpdate(Modify Active Order Status Stage)
    UC_ReceiveAlerts(Receive Automatic Low-Stock Email Alerts)

    %% Relationships
    Customer --> UC_Register
    Customer --> UC_Login
    Customer --> UC_Custom
    Customer --> UC_Cart
    Customer --> UC_Checkout
    Customer --> UC_Pay
    Customer --> UC_Track

    Admin --> UC_Login
    Admin --> UC_ManageStock
    Admin --> UC_StatusUpdate
    Admin --> UC_ReceiveAlerts
```

---

## 2. Entity-Relationship (ER) Diagram

The ER diagram defines the database schema structure, collections, attributes, and relationships managed inside MongoDB by Mongoose models.

```mermaid
erDiagram
    USER {
        ObjectId id PK
        string name
        string email
        string password
        string role "user | admin"
        boolean isVerified
        string verificationToken
        date verificationTokenExpires
    }
    INVENTORY_ITEM {
        ObjectId id PK
        string name
        string type "base | sauce | cheese | veggies"
        number quantity
        number threshold
        string unit "units | portions | grams"
    }
    PIZZA_OPTION {
        ObjectId id PK
        string name
        string type "base | sauce | cheese | veggies"
        string description
        number price
        ObjectId inventoryItem FK "ref: InventoryItem"
        boolean isAvailable
    }
    ORDER {
        ObjectId id PK
        ObjectId user FK "ref: User"
        array items "embedded CustomPizzaItem"
        number totalAmount
        string status "received | in the kitchen | out for delivery | delivered"
        string paymentStatus "pending | paid | failed"
        string razorpayOrderId
        string razorpayPaymentId
        string razorpaySignature
        string deliveryAddress
        string contactNumber
        date createdAt
    }
    CUSTOM_PIZZA_ITEM {
        ObjectId base FK "ref: PizzaOption"
        ObjectId sauce FK "ref: PizzaOption"
        ObjectId cheese FK "ref: PizzaOption"
        array veggies FK "refs: PizzaOption[]"
        string size "small | medium | large"
        number quantity
        number price
    }

    USER ||--o{ ORDER : places
    PIZZA_OPTION }|..|| INVENTORY_ITEM : tracks_stock_via
    ORDER ||--|{ CUSTOM_PIZZA_ITEM : contains
    CUSTOM_PIZZA_ITEM }|..|| PIZZA_OPTION : references
```

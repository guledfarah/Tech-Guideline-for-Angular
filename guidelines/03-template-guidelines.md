# Angular Template Guidelines

## Template Structure

### ✅ Do: Keep Templates Clean and Minimal

```html
<ng-container *ngIf="viewModel$ | async as vm">
  <app-user-header [user]="vm.user"></app-user-header>
  <app-user-details [details]="vm.details" (update)="onUpdate($event)">
  </app-user-details>
</ng-container>
```

### ❌ Don't: Create Complex Templates with Business Logic

```html
<!-- Bad: Complex template with business logic -->
<div *ngIf="user$ | async as user">
  <div *ngIf="checkUserPermissions(user)">
    <div *ngFor="let order of filterOrders(user.orders)">
      {{ calculateOrderTotal(order) | currency }}
      <div *ngIf="order.status === 'pending'">
        <!-- More nested conditions -->
      </div>
    </div>
  </div>
</div>
```

## A11y Best Practices

### ✅ Do: Use Semantic HTML and ARIA Attributes

```html
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="menuitem">
      <a [routerLink]="['/dashboard']" aria-current="page"> Dashboard </a>
    </li>
  </ul>
</nav>

<button type="button" aria-label="Close dialog" (click)="closeDialog()">
  <core-icon name="close"></core-icon>
</button>
```

### ❌ Don't: Ignore Accessibility

```html
<!-- Bad: Non-semantic markup and missing a11y attributes -->
<div (click)="navigate()">
  <div>Dashboard</div>
</div>

<div (click)="closeDialog()">
  <img src="close.png" />
</div>
```

## Data Binding

### ✅ Do: Use One-Way Data Flow and Event Binding

```html
<app-user-card
  [user]="user$ | async"
  [isSelected]="isSelected$ | async"
  (select)="onSelect($event)"
>
</app-user-card>

<form (ngSubmit)="onSubmit()">
  <core-input [formControl]="nameControl" label="Name"> </core-input>
</form>
```

### ❌ Don't: Use Two-Way Binding Extensively

```html
<!-- Bad: Overusing two-way binding -->
<input [(ngModel)]="user.name" />
<select [(ngModel)]="user.country">
  <option *ngFor="let country of countries" [value]="country">
    {{country}}
  </option>
</select>
```

## CoreUI Integration

### ✅ Do: Use CoreUI Components Correctly

```html
<core-card>
  <core-card-header>
    <h2 class="heading-2">User Profile</h2>
  </core-card-header>

  <core-card-content>
    <core-form-field>
      <core-label>Name</core-label>
      <core-input [formControl]="nameControl"> </core-input>
      <core-error *ngIf="nameControl.errors?.required">
        Name is required
      </core-error>
    </core-form-field>
  </core-card-content>

  <core-card-actions>
    <core-button variant="primary" type="submit"> Save </core-button>
  </core-card-actions>
</core-card>
```

### ❌ Don't: Mix Material and CoreUI Components

```html
<!-- Bad: Mixing Material and CoreUI -->
<mat-card>
  <core-card-header>
    <mat-form-field>
      <input matInput [(ngModel)]="user.name" />
    </mat-form-field>
  </core-card-header>
</mat-card>
```

## Performance Optimization

### ✅ Do: Use TrackBy with NgFor

```html
<div *ngFor="let item of items$ | async; trackBy: trackById">
  <app-item [item]="item"></app-item>
</div>
```

### ❌ Don't: Perform Heavy Computations in Template

```html
<!-- Bad: Complex computations in template -->
<div *ngFor="let order of orders">
  {{ calculateComplexTotal(order) | currency }}
  <span>{{ getFormattedDate(order.date) }}</span>
</div>
```

## Template References

### ✅ Do: Use Template References Sparingly and Purposefully

```html
<form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)">
  <core-input #nameInput="coreInput" [formControl]="nameControl"> </core-input>

  <button type="button" (click)="nameInput.focus()">Focus Name</button>
</form>
```

### ❌ Don't: Overuse Template References

```html
<!-- Bad: Excessive template references -->
<div #container>
  <div #header>
    <h1 #title>{{ title }}</h1>
  </div>
  <div #content>
    <p #paragraph>{{ content }}</p>
  </div>
</div>
```

## Error Handling

### ✅ Do: Handle Loading and Error States Properly

```html
<ng-container *ngIf="state$ | async as state">
  <ng-container [ngSwitch]="state.status">
    <ng-container *ngSwitchCase="'loading'">
      <core-spinner></core-spinner>
    </ng-container>

    <ng-container *ngSwitchCase="'error'">
      <core-alert type="error"> {{ state.error }} </core-alert>
    </ng-container>

    <ng-container *ngSwitchCase="'success'">
      <app-user-data [data]="state.data"> </app-user-data>
    </ng-container>
  </ng-container>
</ng-container>
```

### ❌ Don't: Mix Loading, Error, and Content States

```html
<!-- Bad: Mixed states -->
<core-spinner *ngIf="loading"></core-spinner>
<div *ngIf="error">{{ error }}</div>
<div *ngIf="!loading && !error">{{ content }}</div>
```

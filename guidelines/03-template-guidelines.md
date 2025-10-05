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

### ✅ Do: Use Dedicated Selector Files for State Management

```typescript
// user-profile.selector.ts
export interface UserProfileState {
  isEditable: boolean;
  hasPremiumAccess: boolean;
  userStatus: UserStatus;
  displayName: string;
  avatarUrl: string;
  stats: UserStats;
}

@Injectable()
export class UserProfileSelectors {
  // Store selectors
  private readonly user$ = this.store.select(selectUser);
  private readonly permissions$ = this.store.select(selectUserPermissions);
  private readonly subscription$ = this.store.select(selectUserSubscription);
  private readonly preferences$ = this.store.select(selectUserPreferences);

  constructor(private readonly store: Store) {}

  // Main state selector combining all state computations
  readonly state = computed<UserProfileState | null>(() => {
    const user = this.user$();
    const permissions = this.permissions$();
    const subscription = this.subscription$();
    const preferences = this.preferences$();

    if (!user || !permissions) return null;

    return {
      isEditable: this.canEdit(permissions),
      hasPremiumAccess: this.checkPremiumAccess(subscription),
      userStatus: this.determineUserStatus(user, subscription),
      displayName: this.formatDisplayName(user, preferences),
      avatarUrl: this.getAvatarUrl(user, subscription),
      stats: this.computeUserStats(user),
    };
  });

  private canEdit(permissions: string[]): boolean {
    return permissions.includes("edit");
  }

  private checkPremiumAccess(subscription: Subscription | null): boolean {
    return subscription?.type === "premium" && !subscription.isExpired;
  }

  private determineUserStatus(
    user: User,
    subscription: Subscription | null
  ): UserStatus {
    if (!user.isVerified) return "unverified";
    if (!subscription) return "inactive";
    if (subscription.isExpired) return "expired";
    return "active";
  }

  private formatDisplayName(user: User, preferences: UserPreferences): string {
    return preferences?.useFullName
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  }

  private getAvatarUrl(user: User, subscription: Subscription | null): string {
    return subscription?.type === "premium"
      ? user.avatarUrl
      : this.getDefaultAvatar(user);
  }

  private computeUserStats(user: User): UserStats {
    return {
      totalPosts: user.posts.length,
      engagement: this.calculateEngagement(user.posts),
      memberSince: this.formatDate(user.joinDate),
    };
  }
}

// user-profile.component.ts
@Component({
  selector: "app-user-profile",
  template: `
    @if (state(); as vm) {
    <app-user-details
      [isEditable]="vm.isEditable"
      [hasPremiumAccess]="vm.hasPremiumAccess"
      [status]="vm.userStatus"
    >
      <app-user-header
        [displayName]="vm.displayName"
        [avatarUrl]="vm.avatarUrl"
      >
      </app-user-header>
      <app-user-stats [stats]="vm.stats"></app-user-stats>
    </app-user-details>
    }
  `,
  providers: [UserProfileSelectors], // Scoped to this component
})
export class UserProfileComponent {
  // Clean component with just the state from selector
  protected readonly state = inject(UserProfileSelectors).state;
}
```

### ❌ Don't: Perform Logic Checks in Templates

```typescript
// Bad: Multiple logic checks in template
@Component({
  template: `
    <!-- Bad: Multiple conditions and negative checks -->
    @if (user() && !isLoading()) {
      @if (hasPermission('edit') && !isLocked()) {
        <app-user-editor [user]="user()" />
      }
      @if (!hasSubscription() || subscription()?.isExpired) {
        <app-upgrade-prompt />
      }
    }
  `,
})
export class BadUserProfileComponent {
  // Bad: Logic spread across multiple properties
  user = signal<User | null>(null);
  isLoading = signal(true);
  subscription = signal<Subscription | null>(null);

  hasPermission(permission: string) {
    return this.permissions().includes(permission);
  }

  // Bad: Template needs to handle multiple conditions
}

// Refactored with component-level state selectors as shown in above "Do: Use Dedicated Selector Files for State Management" example
```

## A11y Best Practices

### ✅ Do: Use Semantic HTML first always; ARIA attributes only when needed

```html
<nav aria-label="Main navigation">
  <ul>
    <li>
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

### ✅ Do: Use CoreUI Components Correctly; before you create a custom component check if it is already in coreUI

```html

```

### ❌ Don't: Mix Material and CoreUI Components

```html
<!-- Bad: Mixing Material and CoreUI -->
```

## Performance Optimization

### ✅ Do: Use Modern Control Flow Syntax

#### ✅ Do: Use TrackBy with For

```html
<!-- Using @if -->
@if (user(); as currentUser) {
<user-profile [data]="currentUser" />
} @else {
<login-prompt />
}

<!-- Using @for with track -->
@for (item of items(); track item.id) {
<app-item [data]="item" />
} @empty {
<no-items-placeholder />
}

<!-- Using @switch -->
@switch (status()) { @case ('loading') {
<loading-spinner />
} @case ('error') {
<error-message [error]="error()" />
} @default {
<content-view />
} }

<!-- Complex iterations with computed values -->
@for ( item of sortedItems(); track item.id; let i = $index; let isFirst =
$first; let isLast = $last ) {
<app-item [data]="item" [isFirst]="isFirst" [isLast]="isLast" [position]="i" />
}
```

### ❌ Don't: Use Legacy *ngIf, *ngFor Directives

```html
<!-- Bad: Using old structural directives -->
<div *ngIf="user$ | async as user">
  <user-profile [data]="user"></user-profile>
</div>

<div *ngFor="let item of items$ | async; trackBy: trackById">
  <app-item [data]="item"></app-item>
</div>

<!-- Bad: Nested structural directives -->
<div *ngIf="items">
  <div *ngFor="let item of items">
    <div *ngIf="item.isVisible">{{ item.name }}</div>
  </div>
</div>

<!-- Bad: Complex computations in template -->
<div *ngFor="let order of orders">
  {{ calculateComplexTotal(order) | currency }}
  <span>{{ getFormattedDate(order.date) }}</span>
</div>
```

### ✅ Do: Leverage Control Flow Features

```html
<!-- Better readability with @if/@for -->
@if (items(); as itemList) { @for (item of itemList; track item.id) { @if
(item.isVisible) {
<app-item [data]="item" />
} } } @else {
<no-items-placeholder />
}

<!-- Using computed values -->
@for (order of sortedOrders(); track order.id) {
<order-item
  [total]="orderTotals()[order.id]"
  [date]="formattedDates()[order.id]"
/>
}
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

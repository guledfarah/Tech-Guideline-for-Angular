# Angular Component Guidelines

## Component Structure and Organization

### ✅ Do: Keep Components Small and Focused

```typescript
@Component({
  selector: "app-user-profile",
  template: '<app-user-details [user]="user$ | async"></app-user-details>',
})
export class UserProfileComponent {
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}
}
```

### ❌ Don't: Create Large, Monolithic Components

```typescript
@Component({
  selector: "app-user-dashboard",
  templateUrl: "./user-dashboard.component.html", // Large template with multiple responsibilities
})
export class UserDashboardComponent {
  user: User;
  orders: Order[];
  notifications: Notification[];
  settings: UserSettings;
  // Many more properties...

  // Multiple methods handling different concerns
  updateUser() {
    /* ... */
  }
  processOrders() {
    /* ... */
  }
  handleNotifications() {
    /* ... */
  }
  // More methods...
}
```

## State Management

### ✅ Do: Use Selectors for State Computations

```typescript
// user-profile.selectors.ts
export const selectUserProfile = createSelector(
  selectUser,
  selectPreferences,
  (user, preferences) => ({
    ...user,
    ...preferences,
    fullName: `${user.firstName} ${user.lastName}`,
  })
);

// user-profile.component.ts
@Component({
  selector: "app-user-profile",
  template: `
    <div *ngIf="userProfile$ | async as profile">
      {{ profile.fullName }}
    </div>
  `,
})
export class UserProfileComponent {
  userProfile$ = this.store.select(selectUserProfile);

  constructor(private store: Store) {}
}
```

### ❌ Don't: Compute State in Components

```typescript
@Component({
  selector: "app-user-profile",
})
export class UserProfileComponent {
  user$ = this.store.select(selectUser);
  preferences$ = this.store.select(selectPreferences);

  // Bad: Computing state in component
  fullName$ = this.user$.pipe(
    map((user) => `${user.firstName} ${user.lastName}`)
  );
}
```

## Subscription Management

### ✅ Do: Use Async Pipe and Declarative Patterns

```typescript
@Component({
  selector: "app-notifications",
  template: `
    <ng-container *ngIf="notifications$ | async as notifications">
      <app-notification-item
        *ngFor="let notification of notifications"
        [notification]="notification"
      >
      </app-notification-item>
    </ng-container>
  `,
})
export class NotificationsComponent {
  notifications$ = this.store.select(selectNotifications);

  constructor(private store: Store) {}
}
```

### ❌ Don't: Manually Subscribe or Modify Local Properties in Subscriptions

```typescript
@Component({
  selector: "app-notifications",
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription;

  constructor(private store: Store) {}

  ngOnInit() {
    // Bad: Manual subscription and local property modification
    this.subscription = this.store
      .select(selectNotifications)
      .subscribe((notifications) => {
        this.notifications = notifications;
        this.processNotifications(); // Side effect
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

## Component Lifecycle

### ✅ Do: Use OnPush Change Detection

```typescript
@Component({
  selector: "app-user-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @Input() user: User;
}
```

### ❌ Don't: Use Default Change Detection for Presentational Components

```typescript
@Component({
  selector: "app-user-card",
  // Bad: Missing OnPush change detection
})
export class UserCardComponent {
  @Input() user: User;
}
```

## Error Handling

### ✅ Do: Handle Errors Declaratively

```typescript
@Component({
  template: `
    <ng-container *ngIf="userProfile$ | async as profile; else error">
      <app-profile [data]="profile"></app-profile>
    </ng-container>
    <ng-template #error>
      <app-error-message [message]="errorMessage$ | async"></app-error-message>
    </ng-template>
  `,
})
export class UserProfileComponent {
  userProfile$ = this.store.select(selectUserProfileWithError).pipe(
    catchError((error) => {
      this.store.dispatch(UserActions.loadUserProfileError({ error }));
      return EMPTY;
    })
  );

  errorMessage$ = this.store.select(selectUserProfileError);
}
```

### ❌ Don't: Handle Errors Imperatively

```typescript
@Component({
  template: `
    <div>{{ userProfile?.name }}</div>
    <div *ngIf="error">{{ error }}</div>
  `,
})
export class UserProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  error: string | null = null;

  ngOnInit() {
    // Bad: Imperative error handling
    this.userService.getProfile().subscribe({
      next: (profile) => (this.userProfile = profile),
      error: (err) => (this.error = err.message),
    });
  }
}
```

## Component Communication

### ✅ Do: Use Input/Output Decorators for Component Communication

```typescript
@Component({
  selector: "app-user-form",
  template: `
    <form (ngSubmit)="onSubmit()">
      <!-- form content -->
    </form>
  `,
})
export class UserFormComponent {
  @Input() initialData: UserData;
  @Output() formSubmit = new EventEmitter<UserData>();

  onSubmit() {
    this.formSubmit.emit(this.formData);
  }
}
```

### ❌ Don't: Use Services for Component-to-Component Communication

```typescript
// Bad: Using a service for component communication
@Injectable()
export class UserComponentCommunicationService {
  private userDataSubject = new Subject<UserData>();
  userData$ = this.userDataSubject.asObservable();

  updateUserData(data: UserData) {
    this.userDataSubject.next(data);
  }
}
```

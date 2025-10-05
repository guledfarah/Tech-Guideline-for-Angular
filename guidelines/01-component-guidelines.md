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

### ✅ Do: Follow Single Symbol Per File Principle

```typescript
// user.interface.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// user-settings.interface.ts
export interface UserSettings {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}

// user-status.enum.ts
export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
}

// user-type.enum.ts
export enum UserType {
  Standard = "standard",
  Premium = "premium",
  Admin = "admin",
}

// user.model.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly status: UserStatus,
    public readonly type: UserType
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

// user-profile.selector.ts
export class UserProfileSelectors {
  readonly state = computed<UserProfileState | null>(() => {
    // selector logic
  });
}
```

### ❌ Don't: Combine Multiple Symbols in Single File

```typescript
// Bad: types.ts - Multiple symbols in one file
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserSettings {
  theme: string;
  notifications: boolean;
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum UserType {
  Standard = "standard",
  Premium = "premium",
}

export class UserModel {
  constructor(public id: string, public name: string) {}
}

// Bad: user.ts - Different types of symbols mixed
export interface UserState {
  user: User | null;
  settings: UserSettings | null;
}

export class UserService {
  getUser(id: string): Observable<User> {
    // ...
  }
}

export const UserActions = createActionGroup({
  // ...
});
```

### ✅ Do: Organize Related Files in Feature Folders

```
src/
└── app/
    └── features/
        └── user/
            ├── models/
            │   ├── user.interface.ts
            │   ├── user-settings.interface.ts
            │   └── user.model.ts
            ├── enums/
            │   ├── user-status.enum.ts
            │   └── user-type.enum.ts
            ├── components/
            │   ├── user-profile/
            │   │   ├── user-profile.component.ts
            │   │   ├── user-profile.component.html
            │   │   └── user-profile.component.scss
            │   └── user-settings/
            │       ├── user-settings.component.ts
            │       ├── user-settings.component.html
            │       └── user-settings.component.scss
            └── selectors/
                └── user-profile.selector.ts
```

### ✅ Do: Use Separate Files for Templates and Styles When Content Exceeds 3 Lines

```typescript
// user-profile.component.ts
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}
}

// user-profile.component.html
<div class="user-profile">
  <app-user-header [user]="user$ | async">
  </app-user-header>
  <div class="user-content">
    <app-user-details [user]="user$ | async">
    </app-user-details>
    <app-user-activity [userId]="(user$ | async)?.id">
    </app-user-activity>
  </div>
</div>

// user-profile.component.scss
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .user-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }
}
```

### ❌ Don't: Include Large Templates or Styles Inline

```typescript
// Bad: Large inline template and styles
@Component({
  selector: "app-user-profile",
  template: `
    <div class="user-profile">
      <app-user-header [user]="user$ | async"> </app-user-header>
      <div class="user-content">
        <app-user-details [user]="user$ | async"> </app-user-details>
        <app-user-activity [userId]="(user$ | async)?.id"> </app-user-activity>
      </div>
    </div>
  `,
  styles: [
    `
      .user-profile {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .user-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
      }
    `,
  ],
})
export class UserProfileComponent {
  // Component logic
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
      template: `
    @if (notifications$ | async; as notifications) {
      @for (notification of notifications; track notification.id) {
        <app-notification-item
          [notification]="notification">
        </app-notification-item>
      }
    }
  `
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

### ✅ Do: Use Signals for Component Communication

```typescript
@Component({
  selector: "app-user-form",
  template: `
    <form (ngSubmit)="onSubmit()">
      <app-form-content
        [formData]="formData()"
        (stateChange)="updateFormState($event)"
      >
      </app-form-content>
    </form>
  `,
})
export class UserFormComponent {
  // Modern input signal
  formData = input<UserData>();

  // Computed state based on input
  protected readonly formState = computed(() => ({
    ...this.formData(),
    isValid: this.validateForm(this.formData()),
  }));

  // Output using signals
  #formStateSignal = signal<UserData | null>(null);
  formSubmitted = output<UserData>();

  constructor() {
    // Automatically react to state changes
    effect(() => {
      const currentState = this.#formStateSignal();
      if (currentState) {
        this.formSubmitted.emit(currentState);
      }
    });
  }

  updateFormState(data: Partial<UserData>) {
    this.#formStateSignal.update((current) => ({
      ...current,
      ...data,
    }));
  }

  private validateForm(data: UserData): boolean {
    return !!data && Object.keys(data).length > 0;
  }
}

// Parent component
@Component({
  template: `
    <app-user-form
      [formData]="initialData()"
      (formSubmitted)="handleSubmission($event)"
    >
    </app-user-form>
  `,
})
export class UserContainerComponent {
  initialData = signal<UserData>({ name: "", email: "" });

  handleSubmission(data: UserData) {
    console.log("Form submitted:", data);
  }
}
```

### ❌ Don't: Use Traditional Input/Output Decorators or Services

```typescript
// Bad: Using traditional Input/Output decorators
@Component({
  selector: "app-user-form",
})
export class UserFormComponent {
  @Input() data: UserData; // Use input() signal instead
  @Output() submit = new EventEmitter<UserData>(); // Use output() signal instead

  // State can become out of sync with parent
  private localState: UserData;

  ngOnChanges(changes: SimpleChanges) {
    if (changes["data"]) {
      this.localState = { ...changes["data"].currentValue };
    }
  }
}

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

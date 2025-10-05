# Angular Component Guidelines

## Component Structure and Organization

### ✅ Do: Keep Components Small and Focused

```typescript
// user-profile.interface.ts
export interface UserProfileState {
  user: User | null;
  isVerified: boolean;
  displayName: string;
}

// user-profile.selector.ts
@Injectable()
export class UserProfileSelectors {
  private readonly store = inject(Store);
  private readonly userService = inject(UserService);
  private readonly preferences = inject(PreferencesService);

  readonly state = computed<UserProfileState | null>(() => {
    const user = this.store.selectSignal(selectUser)();
    if (!user) return null;

    return {
      user,
      isVerified: this.checkVerification(user),
      displayName: this.formatDisplayName(user),
      preferences: this.preferences.getForUser(user.id)
    };
  });

  private checkVerification(user: User): boolean {
    return user.emailVerified && user.phoneVerified;
  }

  private formatDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}

// user-profile.component.ts
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [UserProfileSelectors]
})
export class UserProfileComponent {
  private readonly selectors = inject(UserProfileSelectors);
  private readonly destroy = inject(DestroyRef);

  protected readonly state = this.selectors.state;

  constructor() {
    // Setup automatic cleanup of any subscriptions
    effect(() => {
      const currentState = this.state();
      if (currentState?.needsUpdate) {
        this.refreshData();
      }
    }, { injector: inject(EnvironmentInjector) });
  }

  private refreshData(): void {
    // Example of using DestroyRef for cleanup
    firstValueFrom(this.selectors.refreshUser()).pipe(
      takeUntilDestroyed(this.destroy)
    );
  }
}

// user-profile.component.html
<app-user-details
  @if(state(); as vm)
  [userData]="vm.user"
  [isVerified]="vm.isVerified">
  <h2>{{ vm.displayName }}</h2>
</app-user-details>

// user-profile.component.scss
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

### ✅ Do: Use inject() Function for Dependency Injection

```typescript
// user-profile.selector.ts
@Injectable()
export class UserProfileSelectors {
  private readonly store = inject(Store);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly state = computed<UserProfileState | null>(() => {
    const user = this.store.selectSignal(selectUser)();
    if (!user) return null;
    return this.computeState(user);
  });

  private computeState(user: User): UserProfileState {
    // state computation
  }
}

// user-notification.service.ts
@Injectable({
  providedIn: "root",
})
export class UserNotificationService {
  private readonly store = inject(Store);
  private readonly notifier = inject(NotificationService);
  private readonly analytics = inject(AnalyticsService);

  async sendNotification(userId: string, message: string): Promise<void> {
    try {
      await this.notifier.send(userId, message);
      this.analytics.track("notification_sent");
    } catch (error) {
      this.handleError(error);
    }
  }
}

// feature.component.ts
@Component({
  selector: "app-feature",
  template: "...",
  providers: [FeatureSelectors],
})
export class FeatureComponent {
  private readonly selectors = inject(FeatureSelectors);
  private readonly actions = inject(Actions);
  private readonly destroy = inject(DestroyRef);

  protected readonly state = this.selectors.state;

  constructor() {
    effect(() => {
      // React to state changes
      const currentState = this.state();
      if (currentState?.needsUpdate) {
        this.refreshData();
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.actions
      .pipe(ofType(FeatureActions.event), takeUntilDestroyed(this.destroy))
      .subscribe(/* handle events */);
  }
}
```

### ❌ Don't: Use Constructor Injection for Multiple Dependencies

```typescript
// Bad: Constructor injection with many dependencies
@Component({
  selector: "app-feature",
})
export class FeatureComponent implements OnInit, OnDestroy {
  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notifier: NotificationService,
    private readonly analytics: AnalyticsService
  ) {}

  private subscription: Subscription;

  ngOnInit() {
    this.subscription = this.actions$
      .pipe(ofType(FeatureActions.event))
      .subscribe(/* handle events */);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
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

### ✅ Do: Use Separate Files for Templates and Styles When Content Exceeds 3 Lines

```typescript
// user-profile.interface.ts
export interface UserProfileState {
  user: User | null;
  headerInfo: UserHeaderInfo;
  activityData: UserActivityData;
}

// user-profile.selector.ts
@Injectable()
export class UserProfileSelectors {
  constructor(private readonly store: Store) {}

  readonly state = computed<UserProfileState | null>(() => {
    const user = this.store.selectSignal(selectUser)();
    if (!user) return null;

    return {
      user,
      headerInfo: this.computeHeaderInfo(user),
      activityData: this.computeActivityData(user)
    };
  });

  private computeHeaderInfo(user: User): UserHeaderInfo {
    return {
      displayName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatarUrl,
      role: user.role
    };
  }

  private computeActivityData(user: User): UserActivityData {
    return {
      recentActivities: user.activities.slice(0, 5),
      activityCount: user.activities.length
    };
  }
}

// user-profile.component.ts
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [UserProfileSelectors]
})
export class UserProfileComponent {
  protected readonly state = inject(UserProfileSelectors).state;
}

// user-profile.component.html
<div class="user-profile" @if="state(); as vm">
  <app-user-header [headerInfo]="vm.headerInfo">
  </app-user-header>

  <div class="user-content">
    <app-user-details [userData]="vm.user">
    </app-user-details>
    <app-user-activity [activityData]="vm.activityData">
    </app-user-activity>
  </div>
</div>

// user-profile.component.scss
.user-profile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  .user-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-md);
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
// user-profile-state.interface.ts
export interface UserProfileState {
  displayName: string;
  emailVerified: boolean;
  preferredTheme: string;
  notificationCount: number;
}

// user-profile.selector.ts
@Injectable()
export class UserProfileSelectors {
  private readonly user = this.store.selectSignal(selectUser);
  private readonly preferences = this.store.selectSignal(selectPreferences);
  private readonly notifications = this.store.selectSignal(selectNotifications);

  constructor(private readonly store: Store) {}

  readonly state = computed<UserProfileState | null>(() => {
    const user = this.user();
    const prefs = this.preferences();
    const notifications = this.notifications();

    if (!user || !prefs) return null;

    return {
      displayName: this.formatDisplayName(user),
      emailVerified: user.emailVerified,
      preferredTheme: prefs.theme,
      notificationCount: this.countUnread(notifications)
    };
  });

  private formatDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  private countUnread(notifications: Notification[]): number {
    return notifications?.filter(n => !n.read).length ?? 0;
  }
}

// user-profile.component.ts
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  providers: [UserProfileSelectors]
})
export class UserProfileComponent {
  protected readonly state = inject(UserProfileSelectors).state;
}

// user-profile.component.html
<div class="profile-container" @if="state(); as vm">
  <h1>{{ vm.displayName }}</h1>
  <app-verification-badge [verified]="vm.emailVerified" />
  <app-theme-switcher [currentTheme]="vm.preferredTheme" />
  <app-notification-badge [count]="vm.notificationCount" />
</div>
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
// notification-state.interface.ts
export interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  hasMore: boolean;
}

// notification-item.interface.ts
export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

// notification.selector.ts
@Injectable()
export class NotificationSelectors {
  private readonly notifications = this.store.selectSignal(selectNotifications);
  private readonly preferences = this.store.selectSignal(selectNotificationPreferences);

  constructor(private readonly store: Store) {}

  readonly state = computed<NotificationState | null>(() => {
    const items = this.notifications();
    if (!items) return null;

    return {
      items: this.sortNotifications(items),
      unreadCount: this.countUnread(items),
      hasMore: items.length >= 10
    };
  });

  private sortNotifications(items: NotificationItem[]): NotificationItem[] {
    return [...items].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private countUnread(items: NotificationItem[]): number {
    return items.filter(n => !n.read).length;
  }
}

// notifications.component.ts
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [NotificationSelectors]
})
export class NotificationsComponent {
  protected readonly state = inject(NotificationSelectors).state;
}

// notifications.component.html
<div class="notifications-panel" @if="state(); as vm">
  <header class="panel-header">
    <h2>Notifications ({{ vm.unreadCount }})</h2>
  </header>

  <section class="notification-list">
    @for (item of vm.items; track item.id) {
      <app-notification-item
        [data]="item"
      />
    } @empty {
      <app-empty-state
        message="No notifications yet"
      />
    }
  </section>

  @if (vm.hasMore) {
    <app-load-more-button />
  }
</div>

// notifications.component.scss
.notifications-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  .panel-header {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
  }

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
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

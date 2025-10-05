# Store and NGRX Guidelines

## Store Structure

### ✅ Do: Organize Store by Feature Modules

```typescript
// user/store/index.ts
export const userFeature = createFeature({
  name: "user",
  reducer: createReducer(
    initialState,
    on(UserActions.loadSuccess, (state, { user }) => ({ ...state, user }))
  ),
});

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideState(userFeature),
    // other features...
  ],
};
```

### ❌ Don't: Create a Monolithic Store

```typescript
// Bad: Single large state interface
interface AppState {
  users: User[];
  orders: Order[];
  products: Product[];
  cart: Cart;
  auth: AuthState;
  ui: UiState;
  // Many more properties...
}
```

## Actions

### ✅ Do: Use Strongly Typed Actions

```typescript
// user.actions.ts
export const loadUser = createActionGroup({
  source: "User",
  events: {
    "Load Request": props<{ id: string }>(),
    "Load Success": props<{ user: User }>(),
    "Load Failure": props<{ error: Error }>(),
  },
});

// Usage
this.store.dispatch(loadUser.loadRequest({ id: "123" }));
```

### ❌ Don't: Use String Actions or Any Type

```typescript
// Bad: Stringly typed actions
export const LOAD_USER = "[User] Load";
export const LOAD_USER_SUCCESS = "[User] Load Success";

// Bad: Loosely typed payload
export class LoadUser {
  readonly type = LOAD_USER;
  constructor(public payload: any) {} // Bad: any type
}
```

## Selectors

### ✅ Do: Create Reusable Selectors with MemoizationC

```typescript
// user.selectors.ts
export const selectUserState = createFeatureSelector<UserState>("user");

export const selectUser = createSelector(
  selectUserState,
  (state) => state.user
);

export const selectUserWithDetails = createSelector(
  selectUser,
  selectUserPreferences,
  selectUserSettings,
  (user, preferences, settings) => ({
    ...user,
    preferences,
    settings,
  })
);

// Usage in component
@Component({
  template: `
    <user-profile *ngIf="user$ | async as user" [user]="user"> </user-profile>
  `,
})
export class UserProfileComponent {
  user$ = this.store.select(selectUserWithDetails);
}
```

### ❌ Don't: Select Entire State or Compute in Components

```typescript
// Bad: Selecting whole state
@Component({})
export class BadComponent {
  constructor(private store: Store<AppState>) {
    // Bad: Selecting entire state
    this.store
      .select((state) => state)
      .subscribe((state) => {
        this.processState(state);
      });
  }

  // Bad: Computing derived state in component
  private processState(state: AppState) {
    this.userDetails = {
      ...state.user,
      ...state.preferences,
      fullName: `${state.user.firstName} ${state.user.lastName}`,
    };
  }
}
```

## Effects

### ✅ Do: Handle Side Effects Properly

```typescript
// user.effects.ts
@Injectable()
export class UserEffects {
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadRequest),
      exhaustMap(({ id }) =>
        this.userService.getUser(id).pipe(
          map((user) => UserActions.loadSuccess({ user })),
          catchError((error) => of(UserActions.loadFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private userService: UserService) {}
}
```

### ❌ Don't: Handle Side Effects in Components or Services

```typescript
// Bad: Side effects in component
@Component({})
export class BadComponent implements OnInit {
  ngOnInit() {
    // Bad: Side effect in component
    this.userService.getUser().subscribe(
      (user) => this.store.dispatch(UserActions.loadSuccess({ user })),
      (error) => this.store.dispatch(UserActions.loadFailure({ error }))
    );
  }
}
```

## State Updates

### ✅ Do: Use Immutable State Updates

```typescript
// user.reducer.ts
export const reducer = createReducer(
  initialState,
  on(UserActions.updateProfile, (state, { profile }) => ({
    ...state,
    profile: {
      ...state.profile,
      ...profile,
    },
  }))
);
```

### ❌ Don't: Mutate State Directly

```typescript
// Bad: Mutating state
export const reducer = createReducer(
  initialState,
  on(UserActions.updateProfile, (state, { profile }) => {
    // Bad: Direct state mutation
    state.profile = profile;
    return state;
  })
);
```

## Component Integration

### ✅ Do: Use Facade Pattern for Complex Features

```typescript
@Injectable()
export class UserFacade {
  user$ = this.store.select(selectUser);
  userLoading$ = this.store.select(selectUserLoading);
  userError$ = this.store.select(selectUserError);

  constructor(private store: Store) {}

  loadUser(id: string) {
    this.store.dispatch(UserActions.loadRequest({ id }));
  }

  updateUser(user: User) {
    this.store.dispatch(UserActions.updateRequest({ user }));
  }
}

// Usage in component
@Component({
  template: `
    <ng-container *ngIf="facade.user$ | async as user">
      <app-user-form [user]="user" (save)="facade.updateUser($event)">
      </app-user-form>
    </ng-container>
  `,
})
export class UserProfileComponent {
  constructor(public facade: UserFacade) {}
}
```

### ❌ Don't: Dispatch Actions Directly in Components

```typescript
// Bad: Direct store usage in components
@Component({})
export class BadComponent {
  constructor(private store: Store) {}

  loadUser(id: string) {
    // Bad: Direct store dispatch
    this.store.dispatch({ type: "[User] Load", payload: id });
  }

  // Bad: Multiple subscriptions
  user$ = this.store.select((state) => state.user);
  preferences$ = this.store.select((state) => state.preferences);
  settings$ = this.store.select((state) => state.settings);
}
```

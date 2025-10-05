# Angular Services Guidelines

## Service Design

### ✅ Do: Create Single-Responsibility Services

```typescript
@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`/api/users/${user.id}`, user);
  }
}
```

### ❌ Don't: Create God Services

```typescript
// Bad: Service doing too many things
@Injectable({
  providedIn: "root",
})
export class AppService {
  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router
  ) {}

  // Bad: Mixing concerns
  getUser() {
    /* ... */
  }
  updateUserPreferences() {
    /* ... */
  }
  handleAuthentication() {
    /* ... */
  }
  processOrders() {
    /* ... */
  }
  manageCart() {
    /* ... */
  }
  // Many more methods...
}
```

## HTTP Requests

### ✅ Do: Use Type-Safe HTTP Requests with Error Handling

```typescript
@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new UserNotFoundException(id));
        }
        return throwError(
          () => new ApiException("Failed to fetch user", error)
        );
      })
    );
  }
}

// Usage with proper error handling
@Component({})
export class UserComponent {
  user$ = this.userService.getUser(this.id).pipe(
    catchError((error) => {
      if (error instanceof UserNotFoundException) {
        this.notificationService.show("User not found");
      }
      return EMPTY;
    })
  );
}
```

### ❌ Don't: Use Untyped Requests or Handle Errors Poorly

```typescript
// Bad: Untyped requests and poor error handling
@Injectable({
  providedIn: "root",
})
export class BadService {
  getUser(id: string) {
    return this.http.get("/api/users/" + id).pipe(
      catchError((error) => {
        console.error("Error:", error);
        return of(null); // Bad: Swallowing error
      })
    );
  }
}
```

## Caching

### ✅ Do: Implement Smart Caching Strategies

```typescript
@Injectable({
  providedIn: "root",
})
export class UserService {
  private cache = new Map<string, BehaviorSubject<User>>();

  getUser(id: string): Observable<User> {
    if (!this.cache.has(id)) {
      this.cache.set(id, new BehaviorSubject<User>(null));
      this.fetchUser(id);
    }
    return this.cache.get(id).asObservable();
  }

  private fetchUser(id: string): void {
    this.http
      .get<User>(`/api/users/${id}`)
      .pipe(
        tap((user) => this.cache.get(id).next(user)),
        catchError((error) => {
          this.cache.delete(id);
          return throwError(() => error);
        })
      )
      .subscribe();
  }

  invalidateCache(id?: string): void {
    if (id) {
      this.cache.delete(id);
    } else {
      this.cache.clear();
    }
  }
}
```

### ❌ Don't: Implement Poor Caching

```typescript
// Bad: Poor caching implementation
@Injectable({
  providedIn: "root",
})
export class BadService {
  private cachedData: any = {}; // Bad: Untyped cache

  getUser(id: string) {
    if (this.cachedData[id]) {
      return of(this.cachedData[id]); // Bad: No cache invalidation
    }

    return this.http
      .get(`/api/users/${id}`)
      .pipe(tap((data) => (this.cachedData[id] = data)));
  }
}
```

## Dependency Injection

### ✅ Do: Use Proper DI and Interface Segregation

```typescript
// interfaces.ts
interface UserRepository {
  getUser(id: string): Observable<User>;
  updateUser(user: User): Observable<User>;
}

// implementation.ts
@Injectable({
  providedIn: "root",
})
export class ApiUserRepository implements UserRepository {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`/api/users/${user.id}`, user);
  }
}

// Configure in module
@NgModule({
  providers: [{ provide: UserRepository, useClass: ApiUserRepository }],
})
export class UserModule {}

// Usage in component
@Component({})
export class UserComponent {
  constructor(private userRepo: UserRepository) {}
}
```

### ❌ Don't: Tightly Couple Dependencies

```typescript
// Bad: Tightly coupled dependencies
@Injectable({
  providedIn: "root",
})
export class BadService {
  constructor(
    private http: HttpClient,
    private store: Store,
    private router: Router,
    private notificationService: NotificationService
  ) // Many more dependencies...
  {}
}
```

## Error Handling

### ✅ Do: Create Custom Error Types and Handle Them Properly

```typescript
// errors.ts
export class ApiException extends Error {
  constructor(
    message: string,
    public readonly originalError: any,
    public readonly statusCode?: number
  ) {
    super(message);
  }
}

// service.ts
@Injectable({
  providedIn: "root",
})
export class UserService {
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      retry(3),
      timeout(5000),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new ApiException("Request timed out", error));
        }
        return throwError(
          () => new ApiException("Failed to fetch user", error)
        );
      })
    );
  }
}
```

### ❌ Don't: Use Generic Error Handling

```typescript
// Bad: Generic error handling
@Injectable({
  providedIn: "root",
})
export class BadService {
  getUser(id: string) {
    return this.http.get(`/api/users/${id}`).pipe(
      catchError((error) => {
        console.error("Error occurred:", error);
        return EMPTY; // Bad: Swallowing error
      })
    );
  }
}
```

## Observable Management

### ✅ Do: Use Proper Observable Operators and Cleanup

```typescript
@Injectable({
  providedIn: "root",
})
export class UserService {
  private userSubject = new BehaviorSubject<User>(null);
  user$ = this.userSubject.asObservable();

  refreshUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`).pipe(
      shareReplay(1),
      tap((user) => this.userSubject.next(user))
    );
  }

  getUserUpdates(id: string): Observable<User> {
    return interval(30000).pipe(
      switchMap(() => this.refreshUser(id)),
      retry(3),
      catchError((error) => {
        this.errorHandler.handle(error);
        return EMPTY;
      })
    );
  }
}
```

### ❌ Don't: Mishandle Observables

```typescript
// Bad: Poor Observable management
@Injectable({
  providedIn: "root",
})
export class BadService {
  private subject = new Subject(); // Bad: Untyped subject

  // Bad: Exposing subject directly
  getUpdates() {
    return this.subject;
  }

  // Bad: Not cleaning up subscriptions
  startUpdates() {
    interval(1000).subscribe((val) => {
      this.subject.next(val);
    });
  }
}
```

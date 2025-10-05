# Angular Directives and Pipes Guidelines

## Directive Design

### ✅ Do: Create Focused, Reusable Directives

```typescript
@Directive({
  selector: "[appTooltip]",
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input("appTooltip") text = "";
  @Input() position: "top" | "bottom" | "left" | "right" = "top";

  private tooltipElement: HTMLElement;
  private readonly destroy$ = new Subject<void>();

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.setupTooltip();
  }

  private setupTooltip(): void {
    fromEvent(this.el.nativeElement, "mouseenter")
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.showTooltip());

    fromEvent(this.el.nativeElement, "mouseleave")
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.hideTooltip());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### ❌ Don't: Create Complex, Multi-Purpose Directives

```typescript
// Bad: Directive doing too many things
@Directive({
  selector: "[appSuperDirective]",
})
export class SuperDirective {
  @Input() tooltipText: string;
  @Input() highlightColor: string;
  @Input() dragConfig: any;
  @Input() resizeConfig: any;

  // Bad: Mixing multiple concerns
  constructor() {
    this.setupTooltip();
    this.setupDrag();
    this.setupResize();
    this.setupHighlight();
  }
}
```

## Attribute Directives

### ✅ Do: Use Host Listeners and Host Bindings

```typescript
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input('appHighlight') highlightColor = 'yellow';

  @HostBinding('style.backgroundColor') backgroundColor: string;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.backgroundColor = this.highlightColor;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.backgroundColor = null;
  }
}

// Usage
<div [appHighlight]="'blue'">
  This text will be highlighted in blue on hover
</div>
```

### ❌ Don't: Manipulate the DOM Directly

```typescript
// Bad: Direct DOM manipulation
@Directive({
  selector: "[appBadHighlight]",
})
export class BadHighlightDirective {
  constructor(private el: ElementRef) {
    // Bad: Direct element manipulation
    this.el.nativeElement.style.backgroundColor = "yellow";
    this.el.nativeElement.addEventListener("click", () => {
      // More direct manipulation
    });
  }
}
```

## Structural Directives

### ✅ Do: Implement Custom Structural Directives Properly

```typescript
@Directive({
  selector: '[appRepeatTimes]',
  standalone: true
})
export class RepeatTimesDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set appRepeatTimes(times: number) {
    this.viewContainer.clear();
    for (let i = 0; i < times; i++) {
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: i,
        index: i
      });
    }
  }
}

// Usage
<div *appRepeatTimes="3; let i = index">
  Item {{i}}
</div>
```

### ❌ Don't: Create Overcomplicated Structural Directives

```typescript
// Bad: Overly complex structural directive
@Directive({
  selector: "[appComplexRepeat]",
})
export class ComplexRepeatDirective {
  @Input() set appComplexRepeat(config: any) {
    // Bad: Complex configuration object
    this.viewContainer.clear();
    // Bad: Complex logic with multiple responsibilities
    this.handlePagination();
    this.handleSorting();
    this.handleFiltering();
  }
}
```

## Custom Pipes

### ✅ Do: Create Pure, Efficient Pipes

```typescript
@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

// Usage
<span>{{ fileSize | fileSize }}</span>
```

### ❌ Don't: Create Impure Pipes with Side Effects

```typescript
// Bad: Impure pipe with side effects
@Pipe({
  name: "badPipe",
  pure: false, // Bad: Impure pipe
})
export class BadPipe implements PipeTransform {
  constructor(private service: DataService) {}

  transform(value: any): any {
    // Bad: Side effect in pipe
    this.service.logTransformation(value);
    // Bad: Complex computation in pipe
    return this.service.heavyComputation(value);
  }
}
```

## Performance Optimization

### ✅ Do: Use Pure Pipes Instead of Methods

```typescript
// Good: Pure pipe for formatting
@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(date: Date, format = 'medium'): string {
    if (!date) return '';
    return formatDate(date, format, 'en-US');
  }
}

// Usage in template
<span>{{ user.createdAt | formatDate:'short' }}</span>
```

### ❌ Don't: Use Methods in Templates

```typescript
// Bad: Method in template
@Component({
  template: `
    <!-- Bad: Method call in template -->
    <span>{{ formatDate(user.createdAt) }}</span>
  `,
})
export class BadComponent {
  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}
```

## A11y in Directives

### ✅ Do: Enhance Accessibility with Directives

```typescript
@Directive({
  selector: '[appA11yClick]',
  standalone: true
})
export class A11yClickDirective {
  @Input() appA11yClick: () => void;

  @HostBinding('attr.role') role = 'button';
  @HostBinding('attr.tabindex') tabindex = '0';

  @HostListener('click')
  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  onClick(): void {
    this.appA11yClick();
  }
}

// Usage
<div [appA11yClick]="onAction"
     aria-label="Perform action">
  Click or press Enter
</div>
```

### ❌ Don't: Ignore Accessibility in Directives

```typescript
// Bad: Ignoring accessibility
@Directive({
  selector: "[appClickable]",
})
export class BadClickableDirective {
  @HostListener("click")
  onClick(): void {
    // Bad: No keyboard support
    // Bad: No ARIA attributes
    this.doSomething();
  }
}
```

## Testing

### ✅ Do: Write Comprehensive Tests for Directives and Pipes

```typescript
describe("HighlightDirective", () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  @Component({
    template: ` <div [appHighlight]="color">Test</div> `,
  })
  class TestComponent {
    color = "yellow";
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [HighlightDirective],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it("should highlight on mouseenter", () => {
    const el = fixture.debugElement.query(By.directive(HighlightDirective));
    el.triggerEventHandler("mouseenter");
    fixture.detectChanges();

    expect(el.nativeElement.style.backgroundColor).toBe("yellow");
  });
});
```

### ❌ Don't: Skip Testing or Write Poor Tests

```typescript
// Bad: Insufficient testing
describe("BadDirective", () => {
  it("should create", () => {
    const directive = new BadDirective();
    expect(directive).toBeTruthy();
  });
  // Bad: No behavior testing
  // Bad: No edge cases
  // Bad: No integration testing
});
```

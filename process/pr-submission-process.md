# Pull Request Submission Process

## Pre-PR Checklist

### 1. Self-Review Phase

Before requesting team review, developers must:

- Complete development and dev testing
- Switch to "reviewer mindset" and review your own code against tech guidelines:
  - Component Guidelines
    - Single responsibility principle
    - Proper state management with selectors
    - Clean templates without logic
    - Signal-based implementations
  - SCSS Guidelines
    - BEM methodology
    - Proper use of variables and mixins
    - A11y considerations
  - Template Guidelines
    - Modern control flow (@if, @for)
    - No complex logic in templates
    - Proper component communication
  - Store/NGRX Guidelines
    - Proper state management
    - Clean effects
    - Well-structured selectors
  - Services Guidelines
    - Single responsibility
    - Proper error handling
    - Clean observable patterns
  - Directives/Pipes Guidelines
    - Focused functionality
    - Proper lifecycle management
    - A11y considerations

### 2. Team Review Session

#### Preparation

- Schedule a quick team review session
- Prepare a brief demo of:
  - The card requirements
  - Your implementation approach
  - Key architectural decisions
  - Any deviations from standard patterns (if applicable)

#### During the Session

- Present your changes:

  ```
  1. Show the card requirements
  2. Demo the feature/changes
  3. Walk through code changes
  4. Highlight any complex logic or patterns used
  ```

- Team members should:

  ```
  - Share relevant experiences from past PRs
  - Suggest improvements based on previous feedback
  - Point out potential issues before formal PR
  - Share best practices that could be applied
  ```

#### Action Items

- Take notes of all feedback
- Identify quick fixes vs larger refactoring needs
- Document any decisions made about architectural choices in Design Note task

### 3. Pre-PR Updates

Before creating the actual PR:

- Implement all agreed-upon changes from team review
- Run full test suite
- Update Dev Test and Design Note documentation if needed
- Ensure commit messages are clear and follow conventions
- Double-check for any debug code or console logs
- Enough whitespace added for clear code readability and no extra whitespaces

### Card Task Updates

```markdown
## Design Note Task:

- Detailed list of changes
- Include architectural decisions
- Note any deviations from standard patterns
- Summary of team review session
- Key points discussed
- Decisions made

## Dev Test Task:

- What was tested
- How it was tested
- Any special testing considerations
- All Scenarios in card must be tested
- Any scenario that can not be tested must be clearly documented and reason added

## Screenshots/Videos Attached to Dev Test task (open for discussions)

- Before/After screenshots if UI changes
- Video demo for complex interactions

## Checklist

- [ ] Self-review against guidelines completed
- [ ] Team review session completed
- [ ] All team feedback addressed
- [ ] Local Build, Lint, and Test and manual Dev Tests done
- [ ] Design note and Dev Test task documentations done correctly with accurate information
```

## Post-PR Process

### During Review

- Respond to reviewer comments promptly
- Schedule follow-up team discussion for complex feedback

### After Approval

- Share any learned best practices with team

## Best Practices

### Review Session Tips

- Keep sessions focused and under 30 minutes
- Have code ready to show
- Be open to feedback
- Document decisions made

### Common Review Points

- State management patterns
- Component composition
- Error handling
- Performance considerations
- A11y compliance
- Test coverage

### Knowledge Sharing

- Document repeated feedback patterns
- Update team guidelines when new patterns emerge
- Share learnings in team retrospectives

## Remember

- The goal is to catch issues early
- Team reviews are learning opportunities
- Patterns from previous PRs can improve current code
- Better to get feedback early than during formal review

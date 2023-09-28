## Getting Started
### Organization Member Workflow:
1. **Pick something you are interested in to work on**:  
   Talk to other members of the team/community for ideas and coordination to ensure no duplication of effort
2. **Create a feature branch on local and remote origin (this GitHub repo)**:  
   Create from dev (or other appropriate branch) for your work if one does not already exist.  
   The existence of the remote origin copy of the branch indicates to others that the feature is being worked on.
   ```bash
   git checkout dev               # Switch to the dev branch (or other appropriate branch... NOT main)
   git pull                       # Make sure you have the latest code
   git checkout -b feature/x      # Create and switch to the new feature branch
   git push -u origin feature/x   # Push the branch to the remote origin repository (this GitHub repo)
   ```
3. **Committing to the Feature Branch**:  
   Make atomic commits to this local feature branch as you work on the feature.  
   These commits SHOULD be as small and atomic as possible. We will group them later for the PR.
   ```bash
   git add .                                       # Stage all changes
   git commit -m "Implement part X of the feature" # Commit changes
   ```
4. **Push to Remote During Development Frequently**:  
   ```bash
   git push -u origin feature/x    # Push the branch to the remote repository
   ```
5. **Submitting a Pull Request (PR)**:  
   See the [PR Strategy section](pr-strategy) to prepare your code for a PR

### External Collaborator Workflow (non-members):
1. **Pick something you are interested in to work on**:  
   Talk to other members of the team/community for ideas and coordination to ensure no duplication of effort
2. **Create a Fork and Keep It Up to Date**:  
   Click the "fork" button on this repo to fork this repo to your own account  
   Be sure to NOT only fork the main branch (because your feature branch(es) should be based on `dev`)
   ```bash
   # Add 'upstream' repo to list of remotes
   git remote add upstream https://github.com/UPSTREAM-USER/ORIGINAL-PROJECT.git
   
   # Verify the new remote named 'upstream'
   git remote -v
   ```
4. **Create a feature branch**:
   Preferably, ask this GitHub repo's maintainers to create a feature branch for you which you can then pull into your fork.  
   If that won't work, create your new from dev (or other appropriate branch) for your work if one does not already exist.  
   If you create your own branch on your own fork, a PR for just the creation of the branch on this GitHub repo would be appreciate so that the existence of that branch on this repo can indicate to others that the feature is being worked on.
   **Preferred:**
   ```bash
   # Fetch from upstream remote
   git fetch upstream
   
   # View all branches, including those from upstream
   git branch -va
   
   # Checkout your branches and merge upstream
   # git will fast-forward merge if possible. Otherwise, you will need to resolve conflicts.
   git checkout main
   git merge upstream/main
   git checkout dev
   git merge upstream/main
   git checkout <yourFeatureBranch>
   git merge upstream/<yourFeatureBranch>
   ```
   **Not preferred:**
   ```bash
   git checkout dev               # Switch to the dev branch (or other appropriate branch... NOT main)
   git pull                       # Make sure you have the latest code
   git checkout -b feature/x      # Create and switch to the new feature branch
   git push -u origin feature/x   # Push the branch to the remote origin repository (this GitHub repo)
   ```
5. **Committing to the Feature Branch**:  
   Make atomic commits to this local feature branch as you work on the feature.  
   These commits SHOULD be as small and atomic as possible. We will group them later for the PR.
   ```bash
   git add .                                       # Stage all changes
   git commit -m "Implement part X of the feature" # Commit changes
   ```
6. **Submitting a Pull Request (PR)**:  
   Before submitted a PR, ensure your feature branch is based on the lastest from the upstream (this repo)
   ```bash
   # Fetch upstream master and merge with your repo's master branch
   git fetch upstream
   git checkout master
   git merge upstream/master
   git checkout dev
   git merge upstream/dev
   
   # If there were any new commits, rebase your development branch
   git checkout <yourFeatureBranch>
   git rebase dev
   ```
   See the [PR Strategy section](pr-strategy) to prepare your code for a PR
--------------------------------------------------------------------------------------------------------
## Details, Strategies, & Standards
### Work Management Philosphy
- Try to break goals into independent parts. Each independent part should get a feature branch.
- Try to break work into tasks you can accomplish in a single sitting.

### Repo structure:
#### Protected branches:
| Branch       | Purpose              | Stability | Merge Strategy                                            |
| ------------ | -------------------- | --------- | -------------------------------------------------------   |
| main         | deployed code        | stable    | squash and merge PR from curated dev history only         |
| dev          | ready to deploy code | beta      | squash and merge PR from curated feature branch histories |
| raw-history  | full commit history  | unstable  | 3-way merge PR from feature raw branches                  |

#### Other branches:
Merge strategy targeting other branches should be 3-way merge to preserve raw history, preferably via PR.

#### Branching Strategies:
- Only `dev` should be based on `main`
- All top-level feature branches should be based on `dev`
- Sub-feature branches are ok, but should be short-lived
- Feature branches should be as short lived as possible. If you think a feature branch needs to stick around for awhile, that feature is probably not an atomic independent feature (in other words, it can probably be broken up into multiple smaller but still independent features).
- A new feature branch should be created for each independent part of the application actively being worked on.
- Feature branches should be deleted once the component is completed and all changes are merged to main (not dev) or rejected.
- If improvements to a component are planned for the future, but current developement on the feature is paused and all changes in the branch are already merged to main... delete the branch. It can be recreated later for future work.

#### Push strategies:
- Do **_NOT_** rewrite histories that are already pushed to the remote origin (this GitHub repo). This includes feature branches.
  - If you want to be able to rewrite remote histories, then create a fork and do all of your initial commits there. Then submit PRs here when you history there is what you want.
- Pushing to protected branches may only be accomplished via approved merge strategies.
- Pushing to feature branches should be frequent and SHOULD be dirty. We want to maintain the actual process that you went through to get to your solution.
  - History will be cleaned up when submitting the PR.

#### PR Strategy:
- PRs to dev should be submitted for completed features, bug fixes, enhancements, refactors, etc.
  - The changes contained in a single PR should all relate to one and only one independent change.
- Each commit in a PR should be an atomic change toward the end goal of the PR.
- The order of commits in the PR should follow a logical order to get from the tip of the target branch to the tip of the PR. It should read like a book.
- Each commit in the PR should be a high-level step toward the goal of the PR. Large enough that it makes sense as it's own step in the process of creating the feature, but not so large that a reviewer needs to break it down into smaller chunks themselves to understand it.
  - PRs may contain one or many commits. The number of commits in a PR should be the minimum number of steps required for a reviewer to understand how you got from tip of the target to the tip of the PR. Imagine you are writing an ordered bulleted summary of what changes the PR makes. Each bullet should be a commit.
  - Often (but not always), adding a single, small function will be too small on its own for a commit.
  - Often adding an entire feature will be too large for a single commit.
- In addition to code, PRs must contain documentation.
  - Various types of documentation may be required includeing but not limited to:
    - architecture diagrams
    - infrastructure diagrams
    - sequence diagrams
    - code comments
    - long form descriptions of flows, files, classes, functions, philosophies, etc
    - class / logical diagrams
    - data /logic flow diagrams

Detailed instructions for preparing your PR can be found in the [PR Preparation section](pr-preparation).

#### PR Preparation:  
Keep in mind everything from the [PR Strategy section](pr-strategy) when going through the steps in this section.
1. **Create a 'raw' copy of the feature branch**:
    ```bash
    git checkout feature/featureX
    git branch feature/featureX-raw
    ```

2. **Reorder commits, squash commits, and if necessary isolate independent sequences of commits to create multiple PRs**:
    ```bash
    git checkout feature/featureX
    git rebase -i main            # Use 'reword', 'edit', 'fixup', 'squash', 'drop', etc. to reorder and/or adjust commits
    #other git history curation commands:
    #git filter-branch
    #git filter-repo
    #git cherry-pick
    ```

3. **If necessary, create new branches for each independent sequence of commits and push each for a separate PR**:
    ```bash
    #assuming you are already in branch feature/featureX
    git checkout -b feature/featureX-subY <commit-hash-for-part1-end> #create new branch to separate independent sequences of commits
    git push origin feature/featureX-subY                             #push new branch to remote
    
    git checkout feature/featureX
    git checkout -b feature/part2 <commit-hash-for-part2-end>         #create more branches for each independent sequence of commits
    git push origin feature/part2                                     #push each new branch to remote
    ```

4. **Submit PRs**, ensuring to make a note of the order in which the PRs should be evaluated if that is important.

### Code Review Workflow:

1. **Review PR**:  
   A code reviewer reviews the PR just like any other. Any changes suggested can be made by the developer with new commits to the `feature/featureX` branch or the sub-branches thereof if any were created from it.  
   Code review should ensure a matching *-raw branch exists in addition to validating code changes, documetnation, and any other requirements.

3. **Approve and Rebase Merge**:  
   Once the PR is approved, rebase merge it into `dev` to keep its history linear.

### Maintainer Workflow for `raw-history` Branch:

1. **Automate Merge into `raw-history` (via CI/CD)**:  
   Once the rebase merge to `dev` is done, an automated process should kick in to merge `feature/x-raw` into `raw-history`.

    ```bash
    # CI/CD pseudo-code
    feature_branch = detect_feature_branch()   # Detect the feature branch that got merged
    #raw_branch = getRawBranch(featureBranch)

    git checkout raw-history                   # Checkout mirror branch
    git pull                                   # Update it
    git merge $raw_branch                      # Merge the feature branch
    git push origin raw-history                # Push to remote
    ```

2. **Manual Alternative**:  
   If automation isn't set up, manually merge the feature branch into `mirror`.

    ```bash
    git checkout raw-history                   # Checkout mirror
    git pull                                   # Update it
    git merge feature/x-raw                    # Merge the feature branch
    git push origin mirror                     # Push to remote
    ```

### Cleanup (Optional):

1. **Delete the Local and Remote Feature Branch**:  
   After merging is done, you can choose to delete the feature branch.

    ```bash
    git branch -d feature/x                     # Delete local branch
    git push origin --delete feature/x          # Delete remote branch
    ```

By following these steps, we get a clean, linear history in the `main` and`dev` branches while retaining all the nitty-gritty details in the `raw-history` branch.

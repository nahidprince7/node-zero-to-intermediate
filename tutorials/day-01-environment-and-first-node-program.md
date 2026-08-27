# Day 1 — Environment Setup and Your First Node.js Program

> Estimated time: 60 minutes. Setup problems can make this lesson take two sessions. That is completely fine—finish each step correctly instead of rushing.

## What You Will Learn

By the end of this tutorial, you will be able to:

- explain what Node.js does in one sentence;
- use a few essential terminal commands;
- manage Node.js with `nvm`;
- check your Node.js and npm installations;
- create and run a JavaScript file from the terminal;
- read a simple Node.js error instead of being afraid of it.

## Before You Begin

You need:

- a Linux terminal;
- an internet connection only if `nvm` or Node.js is not installed;
- VS Code or another plain-text code editor;
- this workspace: `/home/nahid/Projects/Learning/app`.

### How to follow this course

- Type every command and every line of code yourself.
- Run one step before moving to the next.
- Do not worry if your version numbers differ from the examples.
- If something fails, read the complete error and use the troubleshooting section.

---

## 0–10 Minutes — Understand the Tools

### JavaScript and Node.js are not the same thing

**JavaScript** is a programming language. A JavaScript program needs an environment that can execute it.

A web browser can execute JavaScript. **Node.js** is another environment that can execute JavaScript, usually outside the browser. It lets JavaScript work with server-side features such as files, network connections, operating-system information, and backend APIs.

For now, remember this sentence:

> Node.js is a runtime that lets us execute JavaScript outside a web browser.

### What are `nvm` and `npm`?

- `nvm` means **Node Version Manager**. It installs Node.js and lets you switch between Node.js versions.
- `npm` is Node.js's package manager. It installs libraries and runs project scripts. Installing Node.js also installs npm.

You will use npm properly from Day 31. Today you only need to verify that it exists.

### Terminal and shell

The **terminal** is the window where you type commands. The **shell** reads those commands and asks the operating system to execute them. In this course, the commands use Bash on Linux.

---

## 10–20 Minutes — Learn Basic Navigation

Open a terminal. Type the following command, then press Enter:

```bash
pwd
```

`pwd` means **print working directory**. It shows the directory you are currently inside.

Now type:

```bash
ls
```

`ls` lists the files and directories at your current location.

Move into this course's workspace:

```bash
cd /home/nahid/Projects/Learning/app
```

`cd` means **change directory**. Confirm your location:

```bash
pwd
```

Expected output:

```text
/home/nahid/Projects/Learning/app
```

List the workspace contents:

```bash
ls
```

You should see the `Tutorials` directory. Capitalization matters on Linux: `Tutorials` and `tutorials` are different names.

### Quick check

Without looking above, say what these commands do:

- `pwd`
- `ls`
- `cd`

If you cannot remember one, run it again and observe the result.

---

## 20–35 Minutes — Set Up Node.js

### Step 1: Check whether `nvm` is installed

Run:

```bash
command -v nvm
```

If the output is `nvm`, continue to **Step 3**.

If the command prints nothing, complete Step 2. Do not use `which nvm`: `nvm` is a shell function rather than a normal executable.

### Step 2: Install `nvm` only if it is missing

First verify that `curl` is available:

```bash
curl --version
```

If Bash says `curl: command not found`, install it on Ubuntu/Debian:

```bash
sudo apt update
sudo apt install curl
```

Then run the official `nvm` installer:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
```

This command downloads and runs the installer published by the official `nvm-sh/nvm` project. Do not replace the URL with one from an unknown website.

Close the terminal and open a new one. Verify the installation:

```bash
command -v nvm
```

The output should now be:

```text
nvm
```

If it is still blank, run:

```bash
source ~/.bashrc
command -v nvm
```

### Step 3: Install the current LTS release of Node.js

Run:

```bash
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'
```

What those commands mean:

1. `nvm install --lts` installs the latest Long-Term Support release.
2. `nvm use --lts` activates it in the current terminal.
3. `nvm alias default 'lts/*'` makes an LTS release the default in new terminals.

We use LTS because it is intended for stable, long-lived applications. You do not need to memorize the version number.

### Step 4: Verify everything

Run each command separately:

```bash
nvm --version
node --version
npm --version
```

Each command should print a version number. Your numbers may be different from someone else's; that is normal.

Now ask the system where `node` comes from:

```bash
command -v node
```

When nvm manages Node.js, the displayed path normally contains `.nvm`.

---

## 35–45 Minutes — Create the Practice Folder

Return to the workspace and create today's directory:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-01
cd practice/day-01
pwd
```

The expected final output is:

```text
/home/nahid/Projects/Learning/app/practice/day-01
```

`mkdir` means **make directory**. The `-p` option also creates missing parent directories and does not complain if the directory already exists.

Open the directory in VS Code:

```bash
code .
```

The dot means “the current directory.” If `code` is not available as a terminal command, open VS Code normally and use **File → Open Folder** to open:

```text
/home/nahid/Projects/Learning/app/practice/day-01
```

In VS Code's Explorer panel, create a file named exactly:

```text
hello.js
```

Make sure it is not accidentally named `hello.js.txt`.

---

## 45–55 Minutes — Write and Run Your First Program

Type this code into `hello.js` yourself:

```js
console.log("Hello, Node.js!");
console.log("I am beginning my backend journey.");
```

Save the file. Return to the terminal and confirm that you are inside `practice/day-01`:

```bash
pwd
ls
```

`ls` should show `hello.js`. Run it:

```bash
node hello.js
```

Expected output:

```text
Hello, Node.js!
I am beginning my backend journey.
```

### Understand every piece

Consider the first line:

```js
console.log("Hello, Node.js!");
```

- `console` is an object supplied by the runtime.
- `.log` asks it to display something.
- `"Hello, Node.js!"` is text, also called a string.
- `()` contains the value passed to `log`.
- `;` marks the end of the statement. JavaScript can sometimes insert it automatically, but we will write it consistently.

Node.js executes this file from top to bottom, so the first message appears before the second.

### Make and fix an error deliberately

Add this line at the bottom:

```js
console.log(hello);
```

Save and run the program again:

```bash
node hello.js
```

You should see an error containing something similar to:

```text
ReferenceError: hello is not defined
```

Notice three useful clues:

1. `ReferenceError` is the kind of error.
2. `hello is not defined` describes the problem.
3. The file name and line number show where it happened.

Node treated `hello` as a name because it had no quotation marks. Turn it into text:

```js
console.log("hello");
```

Save and run the program again. It should now finish without an error.

---

## 55–60 Minutes — Independent Exercise

Do not copy an answer from the tutorial. Edit `hello.js` so it prints four lines:

1. A greeting containing your name.
2. `I am learning Node.js.`
3. One reason you want to learn backend development.
4. `Day 1 complete!`

Run the file and check the order of the output.

Then create a second file named `about-node.js`. Make it print, in your own words:

1. What JavaScript is.
2. What Node.js is.
3. What `nvm` does.

Run it with:

```bash
node about-node.js
```

## Common Problems

### `nvm: command not found`

Open a new terminal. If that does not solve it:

```bash
source ~/.bashrc
command -v nvm
```

### `node: command not found`

Confirm that nvm works, then activate the LTS release:

```bash
command -v nvm
nvm use --lts
node --version
```

### `Cannot find module '/some/path/hello.js'`

You are probably in the wrong directory or used the wrong file name. Check both:

```bash
pwd
ls
```

Then move into the correct directory:

```bash
cd /home/nahid/Projects/Learning/app/practice/day-01
node hello.js
```

### The program runs but prints old text

Save the file in VS Code before running it again. The small dot on a VS Code tab means the latest changes are not saved.

### `code: command not found`

Node.js is not broken. Only VS Code's terminal launcher is missing. Open the folder through VS Code's **File → Open Folder** menu and continue.

## Review Questions

Answer these without looking back first:

1. What is the difference between JavaScript and Node.js?
2. Why are we using `nvm` instead of installing one fixed Node.js version?
3. What do `pwd`, `ls`, and `cd` do?
4. Which command executes `hello.js`?
5. Why did `console.log(hello)` fail while `console.log("hello")` worked?
6. When an error occurs, which three clues should you look for?

## Completion Checklist

Day 1 is complete only when all of these are true:

- [ ] `command -v nvm` prints `nvm`.
- [ ] `node --version` prints a version number.
- [ ] `npm --version` prints a version number.
- [ ] `hello.js` runs successfully.
- [ ] You deliberately produced and fixed the `ReferenceError`.
- [ ] You completed the four-line independent exercise.
- [ ] `about-node.js` runs successfully.
- [ ] You can answer at least five of the six review questions without notes.

## What to Send for Review

Before starting Day 2, send:

1. the output of `node --version` and `npm --version`;
2. the code from `hello.js` and `about-node.js`;
3. your answers to the six review questions;
4. anything that felt confusing.

I will review your code and answers, explain mistakes step by step, and only then move you to **Day 2 — Values, Variables, Data Types, and Operators**.

## Official References

- nvm installation and usage: https://github.com/nvm-sh/nvm#installing-and-updating
- Node.js downloads and release information: https://nodejs.org/en/download

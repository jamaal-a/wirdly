# How to Run EAS Build Commands

## ✅ You Can Use the Same Terminal

**Yes, you can run it in the same terminal you're using.** EAS builds run in the cloud, so they don't block your local development.

## 📋 Options:

### Option 1: Same Terminal (Recommended)
```bash
# Just run the command in your current terminal
eas build --platform android --profile preview
```

**Pros:**
- ✅ Simple - no need to open another window
- ✅ You can see the build progress
- ✅ You can continue using the terminal after starting the build

**Note:** The build runs in the cloud, so you can close the terminal or run other commands while it builds.

---

### Option 2: Separate Terminal (If You Have Metro Running)

If you have Metro bundler running (`npx expo start`), you might want to use a separate terminal to keep things organized:

**Terminal 1:** Metro bundler (for development)
```bash
npx expo start
```

**Terminal 2:** EAS Build
```bash
eas build --platform android --profile preview
```

**Pros:**
- ✅ Keeps Metro bundler running
- ✅ Organized - separate concerns
- ✅ Can monitor both processes

---

## 🎯 What Happens When You Run It?

1. **Command starts** - EAS uploads your code to their servers
2. **Build runs in cloud** - Takes 10-20 minutes
3. **You get a link** - When build completes
4. **You can close terminal** - Build continues in cloud

**Important:** The build happens on EAS servers, not your computer. So you can:
- Close the terminal
- Run other commands
- Even shut down your computer (build continues)

---

## 💡 Best Practice:

**For quick testing:**
- Use the same terminal
- Run the command
- Wait for the link (or check EAS dashboard)

**If Metro is running:**
- Use a separate terminal for the build
- Keep Metro running for development

---

## 🔍 How to Check Build Status:

Even if you close the terminal, you can check build status:

1. **EAS Dashboard:** [expo.dev/accounts/jamaal1/projects/wirdly/builds](https://expo.dev/accounts/jamaal1/projects/wirdly/builds)
2. **Or run:** `eas build:list` to see recent builds

---

## 📝 Example Workflow:

```bash
# Terminal 1 (if you want Metro running)
npx expo start

# Terminal 2 (or same terminal)
cd /Users/jamaal/wirdly
eas build --platform android --profile preview

# Wait for build...
# Get download link
# Share with testers
```

---

## ✅ Quick Answer:

**Yes, you can use the same terminal!** It's totally fine. The build runs in the cloud, so it won't interfere with anything else.


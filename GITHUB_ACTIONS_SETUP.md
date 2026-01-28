# GitHub Actions Auto-Deployment Setup Guide

## ✅ What's Already Done:
- GitHub Actions workflow file created (`.github/workflows/deploy.yml`)
- Workflow triggers on every push to master branch
- Automatically pulls code, rebuilds, and restarts containers on EC2

## 🔑 Step 1: Get Your EC2 SSH Private Key

You need the **private SSH key** (not the .pub file) that you use to connect to EC2.

### Find Your Private Key:

**Option A - If you have it locally:**
```powershell
# Check common locations:
Get-ChildItem ~\.ssh\*taskflow* -Recurse
Get-ChildItem "C:\New Volume D\*taskflow*" -Recurse -File | Where-Object { $_.Extension -ne '.pub' }
```

**Option B - If you lost it, create a new one:**

1. On your **local machine** (PowerShell):
```powershell
ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\taskflow-ec2-key"
# Press Enter for no passphrase
```

2. In **EC2 Instance Connect**, add the new public key:
```bash
cat >> ~/.ssh/authorized_keys << 'EOF'
# Paste your PUBLIC key content here (from taskflow-ec2-key.pub)
EOF
```

3. Test the connection from PowerShell:
```powershell
ssh -i "$env:USERPROFILE\.ssh\taskflow-ec2-key" ubuntu@3.218.208.90
```

---

## 🔐 Step 2: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/hansadisr/devops-projects`

2. Click **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret** and add these **3 secrets**:

### Secret 1: `EC2_HOST`
- Name: `EC2_HOST`
- Value: `3.218.208.90`

### Secret 2: `EC2_USERNAME`
- Name: `EC2_USERNAME`
- Value: `ubuntu`

### Secret 3: `EC2_SSH_KEY`
- Name: `EC2_SSH_KEY`
- Value: **Your private SSH key content**

**How to get the private key content:**

**Windows (PowerShell):**
```powershell
# Replace with your actual key path
Get-Content "$env:USERPROFILE\.ssh\taskflow-ec2-key"
```

**Copy the ENTIRE output** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
... (all the lines)
-----END OPENSSH PRIVATE KEY-----
```

**Paste this into the EC2_SSH_KEY secret.**

---

## 🚀 Step 3: Test the Deployment

Once secrets are added, test it:

1. Make a small change to any file (e.g., add a comment):
```javascript
// Test auto-deployment
```

2. Commit and push:
```bash
git add .
git commit -m "Test GitHub Actions auto-deployment"
git push
```

3. Watch the deployment:
   - Go to: `https://github.com/hansadisr/devops-projects/actions`
   - You'll see the workflow running
   - Click on it to see live logs

4. If successful, check your site:
   - Visit: `http://3.218.208.90:3000`
   - Changes should be live!

---

## 🎉 After Setup - How to Use:

From now on, just:
```bash
git add .
git commit -m "Your changes"
git push
```

GitHub Actions will automatically:
1. Detect the push
2. SSH into EC2
3. Pull latest code
4. Rebuild containers
5. Deploy!

**No more manual SSH and docker commands!** 🚀

---

## 🔧 Troubleshooting:

### If deployment fails:

1. Check workflow logs: `https://github.com/hansadisr/devops-projects/actions`
2. Common issues:
   - **SSH key incorrect** → Re-add EC2_SSH_KEY secret
   - **Permission denied** → Check SSH key has correct permissions
   - **Out of space** → Workflow includes cleanup step

### Test SSH connection manually:
```powershell
ssh -i "$env:USERPROFILE\.ssh\taskflow-ec2-key" ubuntu@3.218.208.90
```

If this works, GitHub Actions will work too!

---

## 📝 Next Steps:

1. Find/create your SSH private key
2. Add the 3 secrets to GitHub
3. Push a test commit
4. Watch it auto-deploy!

Let me know if you need help with any step! 🎯

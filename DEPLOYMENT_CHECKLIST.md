# 🚀 Vercel Deployment Checklist

## Pre-Deployment Setup

### ✅ MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster (M0 free tier)
- [ ] Create database user with read/write permissions
- [ ] Configure network access (add 0.0.0.0/0)
- [ ] Get connection string
- [ ] Test connection string locally

### ✅ Environment Variables
- [ ] Generate strong JWT secret: `openssl rand -base64 32`
- [ ] Prepare MongoDB Atlas connection string
- [ ] Note down all required environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `NODE_ENV=production`

### ✅ Code Preparation
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub repository
- [ ] Test application locally
- [ ] Verify all API endpoints work
- [ ] Check frontend builds successfully

## Vercel Deployment

### ✅ Project Setup
- [ ] Sign up for Vercel account
- [ ] Connect GitHub account to Vercel
- [ ] Import project from GitHub
- [ ] Configure project settings:
  - Framework: Other
  - Root Directory: . (default)
  - Build Command: `npm run build`
  - Output Directory: `client/build`

### ✅ Environment Variables in Vercel
- [ ] Add `MONGODB_URI` with Atlas connection string
- [ ] Add `JWT_SECRET` with generated secret
- [ ] Add `NODE_ENV` set to `production`

### ✅ Deployment
- [ ] Click Deploy button
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Test deployed application

## Post-Deployment Testing

### ✅ Functionality Tests
- [ ] Home page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Create post functionality
- [ ] View posts
- [ ] Like/unlike posts
- [ ] User profiles
- [ ] Follow/unfollow users

### ✅ API Tests
- [ ] Test API endpoints directly
- [ ] Verify database connections
- [ ] Check error handling
- [ ] Test authentication flow

## Troubleshooting

### Common Issues
- [ ] Build failures: Check package.json scripts
- [ ] API not working: Verify environment variables
- [ ] Database connection issues: Check MongoDB Atlas settings
- [ ] CORS errors: Verify Vercel routing configuration

### Useful Commands
```bash
# Test build locally
npm run build

# Check environment variables
vercel env ls

# View deployment logs
vercel logs [deployment-url]

# Redeploy
vercel --prod
```

## Security Checklist

- [ ] JWT secret is strong and unique
- [ ] MongoDB user has minimal required permissions
- [ ] No sensitive data in code
- [ ] Environment variables properly configured
- [ ] HTTPS enabled (automatic with Vercel)

## Performance Optimization

- [ ] Enable Vercel Analytics (optional)
- [ ] Configure caching headers (if needed)
- [ ] Monitor API response times
- [ ] Check database query performance

## Backup & Monitoring

- [ ] Set up MongoDB Atlas backups
- [ ] Monitor Vercel deployment status
- [ ] Set up error tracking (optional)
- [ ] Document deployment process

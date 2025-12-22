# Getting started

## Instructions
- This project use `npm` as package manager tool.
  
```bash
npm install
```
```bash
npm run start:dev
```
### Start Container (using Docker)

```bash
docker-compose up -d 
```
### Verify MongoDB is Working.
1. Check running containers:
```bash
docker ps
```
2. Access MongoDB container:
```bash
docker exec -it mongodb bash
```
3. Connect to MongoDB shell:
```bash
mongosh -u root -p
```
When prompted, enter the password: password
4. Show databases:
```bash
show dbs
```
Expected Output:
```bash
admin   100.00 KiB
config   72.00 KiB
lhkem    80.00 KiB
local    72.00 KiB
```
If you see the lhkem database, MongoDB is working correctly :)

### MongoDB Atlas 
<div align="center">
  <img src="https://ik.imagekit.io/496kiwiBird/messageImage_1766259677689.jpg?updatedAt=1766410315497" width="200" height="auto">
</div>

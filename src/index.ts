import * as fs from "fs";
import simpleGit, { ResetMode } from "simple-git";
import { env, loadEnv } from "./utils/env";
import path from "path";

loadEnv();

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const gitUrl = config.url;
const modsDirectory = config.path;

// Function to check if a directory is a Git repository
const isGitRepo = async (folder: string): Promise<boolean> => {
  try {
    const git = simpleGit(folder);
    await git.status();
    return true;
  } catch (err) {
    return false;
  }
};

// Function to clone a repository
const cloneRepo = async (url: string, folder: string): Promise<void> => {
  console.log(`Cloning repository from ${url} to ${folder}...`);
  try {
    const git = simpleGit();
    await git.clone(url, folder);
    console.log("Repository cloned successfully.");
  } catch (err) {
    console.error("Failed to clone repository:", err);
    throw err;
  }
};

// Function to update a repository
const updateRepo = async (folder: string): Promise<void> => {
  console.log(`Updating repository at ${folder}...`);
  try {
    const git = simpleGit(folder);

    // Check if there are local changes
    const statusSummary = await git.status();
    if (statusSummary.files.length > 0 || statusSummary.ahead > 0) {
      console.log("Local changes found. Resetting repository...");
      // Reset hard to origin/master
      await git.reset(ResetMode.HARD, ["origin/master"]);
    }

    // Pull latest changes from origin/master
    await git.pull("origin", "master");

    console.log("Repository updated successfully.");
  } catch (err) {
    console.error("Failed to update repository:", err);
    throw err;
  }
};

// Function to clone if not exists or update if exists
const cloneOrUpdateRepo = async (url: string, folder: string): Promise<void> => {
  try {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      await cloneRepo(url, folder);
    } else {
      const isRepo = await isGitRepo(folder);
      if (!isRepo) {
        console.log(`${folder} exists but is not a Git repository. Cloning...`);
        await cloneRepo(url, folder);
      } else {
        await updateRepo(folder);
      }
    }
  } catch (err) {
    console.error("Error cloning or updating repository:", err);
  }
};

cloneOrUpdateRepo(gitUrl, modsDirectory).catch((err) => console.error("Error in main process:", err));

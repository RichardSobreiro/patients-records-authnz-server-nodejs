/** @format */
import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";
import * as dotenv from "dotenv";

dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
if (!accountName) throw Error("Azure Storage accountName not found");
if (!accountKey) throw Error("Azure Storage accountKey not found");

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

export const createContainerClient = async (username: string) => {
  const containerClient = await blobServiceClient.getContainerClient(
    username.replace("@", "-").replace(".", "-")
  );
  return containerClient;
};

export const createBlobClient = async (
  containerClient: ContainerClient,
  blobName: string
) => {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  return blobClient;
};

export const createBlobSas = async (username: string, imageName: string) => {
  const containerName = username.replace("@", "-").replace(".", "-");
  const sasOptions = {
    containerName: containerName,
    blobName: imageName,
    permissions: BlobSASPermissions.parse("r"), // permissions
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 24 * 60 * 60 * 1000), // 10 minutes
    protocol: SASProtocol.Https,
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  );

  const response = {
    sasToken: sasToken.toString(),
    expiresOn: sasToken.expiresOn,
  };

  return response;
};

export const getBaseBlobURL = (username: string, filename: string) => {
  const containerName = username.replace("@", "-").replace(".", "-");
  const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${filename}`;
  return sasUrl;
};

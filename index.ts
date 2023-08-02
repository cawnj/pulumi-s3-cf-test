import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";

// Config
const config = new pulumi.Config();
const indexDocument = config.require("indexDocument");
const zoneId = config.require("zoneId");
const subdomain = config.require("subdomain");

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("staticSite", {
    website: {
        indexDocument: indexDocument,
    },
});

// Define file ownership settings on bucket
const ownershipControls = new aws.s3.BucketOwnershipControls("ownership-controls", {
    bucket: bucket.id,
    rule: {
        objectOwnership: "ObjectWriter"
    }
});

// Allow bucket to be accessed publicly
const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
    bucket: bucket.id,
    blockPublicAcls: false,
});

// Create an S3 Bucket object (static site)
const bucketObject = new aws.s3.BucketObject(indexDocument, {
    bucket: bucket.id,
    source: new pulumi.asset.FileAsset(indexDocument),
    contentType: "text/html",
    acl: "public-read",
}, { dependsOn: publicAccessBlock });

// Create a Cloudflare DNS record
const dnsRecord = new cloudflare.Record("dnsRecord", {
    zoneId: zoneId,
    name: subdomain,
    type: "CNAME",
    value: bucket.websiteEndpoint,
    proxied: true,
});

// Exports
export const bucketName = bucket.id;
export const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;

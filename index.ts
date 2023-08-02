import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";

// Config
const config = new pulumi.Config();
const indexDocument = config.require("indexDocument");
const zoneId = config.require("zoneId");
const subdomain = config.require("subdomain");

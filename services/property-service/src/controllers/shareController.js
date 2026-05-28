 
import Share from "../models/Share.js";

import {
    generateAdvancedShareToken,
} from "../utils/generateShareToken.js";


export const createShareLink = async (
    req,
    res
) => {
    try {

        const { listingId, userId } = req.body;

        console.log(req.body)

        if (!listingId) {
            return res.status(400).json({
                success: false,
                message: "Listing ID required",
            });
        }
 
        const token =
            generateAdvancedShareToken(
                listingId,
                userId
            );
 
        const share = await Share.create({
            token,
            listingId,
            sharedBy: userId || null,
        });
 
        const shareUrl =
            `${process.env.SERVER_URL}/api/share/open/${token}?shared=True`;

        res.status(201).json({
            success: true,
            shareUrl,
            share,
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }
};

export const openShareLink = async (
    req,
    res
) => {
    try {

        const { token } = req.params;

        const share = await Share.findOne({
            token,
        });

        if (!share) {
            return res
                .status(404)
                .send("Invalid share link");
        }

        share.clicks += 1;

        const device =
            req.headers["user-agent"];

            

        const rawIp =
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            req.ip;

        const ip = rawIp.split(",")[0].trim();

        const alreadyExists =
            share.visitors.some(
                (visitor) =>
                    visitor.ip === ip &&
                    visitor.device === device
            );

        if (!alreadyExists) {

            share.uniqueClicks += 1;

            share.visitors.push({
                ip,
                device,
                visitedAt: new Date(),
            });

        }

        await share.save();

        return res.redirect(
            `${process.env.CLIENT_URL}/details/${share.listingId}`
        );

    } catch (err) {

        console.log(err);

        res.status(500).send(err.message);

    }
};
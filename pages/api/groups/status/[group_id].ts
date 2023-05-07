import { nanoid } from "nanoid";
import db from "../../../../db";
import type { NextApiRequest, NextApiResponse } from "next";

import { ApiError } from "next/dist/server/api-utils";

import RequestError from "../../../../errors";



const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);

      break;

    default:
      return res.send(404);
      break;
  }
};

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!req.query.group_id) throw new ApiError(401, "Group ID Required");

    const group_id = Number(req.query.group_id);


    const group = await db.group.findUnique({
      where: {
        id: group_id,
      },
      include: {
        members: {
          select: {
            name: true,
            leetcodeUsername: true,
            lastUpdated:true,
            lastAccessed:true,
            leetcodeStats: true
          },
        },
      },
    });
  

  
    return res.send(group);
  } catch (error) {
    console.log(error);
    RequestError.response(req, res, error);
  }
};

export default handler;
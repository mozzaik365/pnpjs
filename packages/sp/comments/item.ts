import { addProp } from "@pnp/queryable";
import { _Item, Item } from "../items/types.js";
import { Comments, IComments, ILikeData, ILikedByInformation } from "./types.js";
import { OLD_spPost, spPost } from "../operations.js";
import { extractWebUrl } from "../utils/extractweburl.js";
import { combine } from "@pnp/core/util";
import { OLD_SharePointQueryable } from "../sharepointqueryable.js";

declare module "../items/types" {
    interface _Item {
        readonly comments: IComments;
        getLikedBy(): Promise<ILikeData[]>;
        like(): Promise<void>;
        unlike(): Promise<void>;
        getLikedByInformation(): Promise<ILikedByInformation>;
    }
    interface IItem {
        readonly comments: IComments;
        /**
         * Gets the collection of people who have liked this item
         */
        getLikedBy(): Promise<ILikeData[]>;
        /**
         * Likes this client-side page as the current user
         */
        like(): Promise<void>;
        /**
         * Unlikes this client-side page as the current user
         */
        unlike(): Promise<void>;
        /**
         * Unlikes this item as the current user
         */
        getLikedByInformation(): Promise<ILikedByInformation>;
    }
}

addProp(_Item, "comments", Comments);

_Item.prototype.getLikedBy = function (this: _Item): Promise<ILikeData[]> {
    return spPost<ILikeData[]>(Item(this, "likedBy"));
};

_Item.prototype.like = async function (this: _Item) {
    const itemInfo = await this.getParentInfos();
    const baseUrl = extractWebUrl(this.toUrl());
    const reputationUrl = "_api/Microsoft.Office.Server.ReputationModel.Reputation.SetLike(listID=@a1,itemID=@a2,like=@a3)";
    const likeUrl = combine(baseUrl, reputationUrl) + `?@a1='{${itemInfo.ParentList.Id}}'&@a2='${itemInfo.Item.Id}'&@a3=true`;
    return OLD_spPost(OLD_SharePointQueryable(likeUrl));
};

_Item.prototype.unlike = async function (this: _Item) {
    const itemInfo = await this.getParentInfos();
    const baseUrl = extractWebUrl(this.toUrl());
    const reputationUrl = "_api/Microsoft.Office.Server.ReputationModel.Reputation.SetLike(listID=@a1,itemID=@a2,like=@a3)";
    const likeUrl = combine(baseUrl, reputationUrl) + `?@a1='{${itemInfo.ParentList.Id}}'&@a2='${itemInfo.Item.Id}'&@a3=false`;
    return OLD_spPost(OLD_SharePointQueryable(likeUrl));
};

_Item.prototype.getLikedByInformation = function (this: _Item): Promise<ILikedByInformation> {
    return Item(this, "likedByInformation").expand("likedby")<ILikedByInformation>();
};

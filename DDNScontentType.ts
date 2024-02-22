import { DDNScontentContent } from "./DDNScontentContent.ts";
import { DDNScontentID } from "./DDNScontentID.ts";

/**
 * 响应缓存类型接口
 */

export type DDNScontentType =
    & DDNScontentID
    & DDNScontentContent;

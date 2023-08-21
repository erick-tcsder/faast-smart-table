/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export function getLeafCols(leafNodes: string[], obj: any){
    if(obj.columns){
        obj.columns.forEach(function(child: any){getLeafCols(leafNodes,child)});
    } else{
        leafNodes.push(obj.id ?? "");
    }
}
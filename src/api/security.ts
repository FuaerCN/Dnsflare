import { useAxios } from '@/utils/requests'
import { objectToCamelCase, objectToHungarian } from '@/utils/case'
import { APIResponse } from '.'

export type SecurityLevel = 'essentially_off' | 'low' | 'medium' | 'high' | 'under_attack'

export const SecurityLevelDisplay: Record<SecurityLevel, string> = {
    essentially_off: '基本关闭',
    low: '低',
    medium: '中',
    high: '高',
    under_attack: 'Under Attack模式'
}

export type CloudflareSecurityInfo = {
    result: {
        value: SecurityLevel
    }
}

export async function getSecurityInfo(zoneId: string): Promise<APIResponse<CloudflareSecurityInfo>> {
    const axios = useAxios()

    try {
        const response = await axios.request<any>({
            url: `/zones/${zoneId}/settings/security_level`,
            method: 'get',
        })

        return (objectToCamelCase(response.data) as any)
    } catch (err) {
        return (objectToCamelCase(err.response.data) as any)
    }
}

export async function updateSecurityLevel(zoneId: string, level: SecurityLevel): Promise<APIResponse<any>> {
    const axios = useAxios()
    try {
        const response = await axios.request<any>({
            url: `/zones/${zoneId}/settings/security_level`,
            method: 'patch',
            data: objectToHungarian({
                value: level
            })
        })

        return (objectToCamelCase(response.data) as any)
    } catch (err) {
        return (objectToCamelCase(err.response.data) as any)
    }
}

import { eventSource } from '@/utils/twelvet';
import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/ai/chat';

/**
 * 查询AI知识库列表
 * @param query 查询参数
 */
export async function listModelQueryDoc(query: { [key: string]: any }) {
    return request(`/ai/model/list`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询对应的AI知识库聊天历史记录
 * @param query 查询参数
 */
export async function pageQueryDoc(query: { [key: string]: any }) {
    return request(`/ai/chat/history/page`, {
        method: `get`,
        params: query
    })
}

export const sendMessage = async (
    data: {
        modelId: number,
        content: string
    },
    handleMessage: (data: any) => void,
    handleDone: () => void,
): Promise<void> => {
    eventSource(`${controller}`, data, handleMessage, handleDone);
};

// export const sendMessage = async (
//     message: any,
//     handleMessage: (data: any) => void,
//     handleDone: () => void
// ): Promise<void> => {
//
//     const eventSourceUrl = `/ai/chat`
//
//     const controller = new AbortController();
//
//     request(eventSourceUrl, {
//         method: 'POST',
//         headers: {
//             responseType: 'stream',
//             accept: 'text/event-stream', // 设置响应类型为流
//         },
//         data: {
//             ...message
//         }
//     }).then(response => {
//         //console.log('===response=====', response)
//         response.body.on('data', (chunk) => {
//             console.log('Received chunk:', chunk.toString());
//         });
//
//         response.data.on('end', () => {
//             console.log('Stream ended');
//         });
//
//         response.data.on('error', (err) => {
//             console.error('Stream error:', err);
//         });
//     }).catch(e => {
//         console.log('发生错误', e)
//     })
//
//
// }

<template>
    <div :style="mainStyle">
        <br>
        <el-card v-loading="isLoading">
            <template #header>
                <div style="display: flex">
                    <span>安全与证书设置</span>
                </div>
            </template>
            
            <el-tabs v-model="activeTab">
                <el-tab-pane label="安全设置" name="security">
                    <div class="setting-section">
                        <h3>安全等级</h3>
                        <div class="current-value">
                            当前设置: <el-tag :type="securityLevel === 'under_attack' ? 'danger' : 'info'">{{SecurityLevelDisplay[securityLevel]}}</el-tag>
                        </div>
                        <div class="setting-control">
                            <el-select placeholder="选择安全等级" v-model="newSecurityLevel">
                                <el-option v-for="(obj, value) in SecurityLevelDisplay" :key="value" :label="obj" :value="value" />
                            </el-select>
                            <el-button @click="modifySecurityLevel" type="primary" style="margin-left: 10px">应用更改</el-button>
                        </div>
                        <div class="setting-description" v-if="newSecurityLevel === 'under_attack'">
                            <el-alert
                                title="Under Attack模式将对所有访问者启用严格的安全检查"
                                type="warning"
                                description="此模式会显著增加访问者的延迟，仅在遭受DDoS攻击时启用"
                                show-icon
                                :closable="false"
                            />
                        </div>
                    </div>
                </el-tab-pane>
                
                <el-tab-pane label="证书设置" name="cert">
                    <div class="setting-section">
                        <h3>证书供应商</h3>
                        <div class="current-value">
                            当前设置: <el-tag type="info">{{CertificateAuthorityDisplay[certOwner]}}</el-tag>
                        </div>
                        <div class="setting-control">
                            <el-select placeholder="选择证书供应商" v-model="newCertOwner">
                                <el-option v-for="(obj, value) in CertificateAuthorityDisplay" :key="value" :label="obj" :value="value" />
                            </el-select>
                            <el-button @click="modifyCertAuthority" type="primary" style="margin-left: 10px">应用更改</el-button>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<style scoped>
.setting-section {
    margin-bottom: 20px;
}
.current-value {
    margin: 10px 0;
}
.setting-control {
    display: flex;
    align-items: center;
}
.setting-description {
    margin-top: 15px;
}
</style>

<script lang="ts" setup>
import { ref } from "vue"
import { getCertInfo, CertificateAuthorityDisplay, CertificateAuthority, patchCertAuthority } from '@/api/cert'
import { getSecurityInfo, SecurityLevelDisplay, SecurityLevel, updateSecurityLevel } from '@/api/security'
import { ElMessage } from 'element-plus'

const props = defineProps<{
    zoneId: string
}>()

const isLoading = ref(false)
const mainStyle = ref({})
const activeTab = ref('security')

// 证书相关状态
const certOwner = ref('')
const newCertOwner = ref<CertificateAuthority>('lets_encrypt')

// 安全设置相关状态
const securityLevel = ref<SecurityLevel>('medium')
const newSecurityLevel = ref<SecurityLevel>('medium')

async function loadInfo() {
    isLoading.value = true

    try {
        // 加载证书信息
        const certInfo = await getCertInfo(props.zoneId)
        if (certInfo.success) {
            certOwner.value = certInfo.result!.certificateAuthority
            newCertOwner.value = certInfo.result!.certificateAuthority
        } else {
            console.error('加载证书信息失败', certInfo.errors)
        }

        // 加载安全设置信息
        const securityInfo = await getSecurityInfo(props.zoneId)
        if (securityInfo.success) {
            securityLevel.value = securityInfo.result!.securityLevel
            newSecurityLevel.value = securityInfo.result!.securityLevel
        } else {
            console.error('加载安全设置失败', securityInfo.errors)
        }
    } catch (error) {
        console.error('加载设置信息时出错', error)
        mainStyle.value = {
            display: 'hidden'
        }
    } finally {
        isLoading.value = false
    }
}

async function modifyCertAuthority() {
    isLoading.value = true

    try {
        const res = await patchCertAuthority(props.zoneId, newCertOwner.value)
        if (res.success) {
            ElMessage({
                type: 'success',
                message: '证书供应商修改成功'
            })
            certOwner.value = newCertOwner.value
        } else {
            ElMessage({
                type: 'error',
                message: `修改失败, 错误: ${res.errors[0].message}`,
            })
        }
    } catch (error) {
        ElMessage({
            type: 'error',
            message: '修改证书供应商时发生错误'
        })
    } finally {
        isLoading.value = false
    }
}

async function modifySecurityLevel() {
    isLoading.value = true

    try {
        const res = await updateSecurityLevel(props.zoneId, newSecurityLevel.value)
        if (res.success) {
            ElMessage({
                type: 'success',
                message: '安全等级修改成功'
            })
            securityLevel.value = newSecurityLevel.value
            
            if (newSecurityLevel.value === 'under_attack') {
                ElMessage({
                    type: 'warning',
                    message: '已启用Under Attack模式，所有访问者将经过严格安全检查',
                    duration: 5000
                })
            }
        } else {
            ElMessage({
                type: 'error',
                message: `修改失败, 错误: ${res.errors[0].message}`,
            })
        }
    } catch (error) {
        ElMessage({
            type: 'error',
            message: '修改安全等级时发生错误'
        })
    } finally {
        isLoading.value = false
    }
}

// 初始加载所有设置信息
loadInfo()
</script>

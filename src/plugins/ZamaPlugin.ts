import { PluginApi, IRemixApi } from '@remixproject/plugin-api'
import { logger } from '@utils/logger'
import { pluginStore } from '@/store/pluginStore'

/**
 * ZamaPlugin - 主插件类
 * 继承自 PluginApi，实现 Remix IDE 插件接口
 */
export class ZamaPlugin extends PluginApi {
  constructor() {
    super({
      name: 'zama-plugin',
      displayName: 'Zama Plugin',
      description: 'Advanced Ethereum development plugin with Zama integration',
      version: '1.0.0',
      methods: [
        'getVersion',
        'getStatus',
        'compile',
        'deploy',
        'encrypt',
        'decrypt',
        'getContractAbi',
        'executeTransaction'
      ],
      events: [
        'statusChanged',
        'compilationFinished',
        'deploymentCompleted',
        'encryptionCompleted',
        'transactionExecuted'
      ],
      notifications: {
        'solidity': ['compilationFinished'],
        'filemanager': ['currentFileChanged', 'fileAdded'],
        'terminal': ['log']
      }
    })
    
    logger.info('ZamaPlugin initialized')
  }

  /**
   * 插件加载时调用
   */
  async onLoad(): Promise<void> {
    try {
      logger.info('ZamaPlugin loading...')
      
      // 更新插件状态
      pluginStore.getState().setStatus({
        isLoading: true,
        isActive: false,
        error: undefined
      })

      // 初始化插件配置
      await this.initializePlugin()
      
      logger.info('ZamaPlugin loaded successfully')
    } catch (error) {
      logger.error('Failed to load ZamaPlugin:', error)
      pluginStore.getState().setStatus({
        isLoading: false,
        isActive: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * 插件激活时调用
   */
  async onActivate(): Promise<void> {
    try {
      logger.info('ZamaPlugin activating...')

      // 注册事件监听器
      await this.registerEventListeners()
      
      // 获取当前文件信息
      await this.loadCurrentFile()
      
      // 更新状态为激活
      pluginStore.getState().setStatus({
        isLoading: false,
        isActive: true,
        error: undefined
      })

      // 发送激活事件
      this.emit('statusChanged', { status: 'activated' })
      
      logger.info('ZamaPlugin activated successfully')
    } catch (error) {
      logger.error('Failed to activate ZamaPlugin:', error)
      pluginStore.getState().setStatus({
        isLoading: false,
        isActive: false,
        error: error instanceof Error ? error.message : 'Activation failed'
      })
    }
  }

  /**
   * 插件停用时调用
   */
  async onDeactivate(): Promise<void> {
    logger.info('ZamaPlugin deactivating...')
    
    pluginStore.getState().setStatus({
      isLoading: false,
      isActive: false,
      error: undefined
    })
    
    this.emit('statusChanged', { status: 'deactivated' })
    logger.info('ZamaPlugin deactivated')
  }

  /**
   * 初始化插件配置
   */
  private async initializePlugin(): Promise<void> {
    // 检查 Remix API 可用性
    if (!this.call) {
      throw new Error('Remix API not available')
    }

    // 验证必需的插件是否可用
    const requiredPlugins = ['filemanager', 'solidity', 'terminal']
    for (const plugin of requiredPlugins) {
      try {
        await this.call('manager', 'isActive', plugin)
      } catch (error) {
        logger.warn(`Required plugin '${plugin}' may not be available`)
      }
    }
  }

  /**
   * 注册事件监听器
   */
  private async registerEventListeners(): Promise<void> {
    // 监听编译完成事件
    this.on('solidity', 'compilationFinished', (fileName: string, source: any, languageVersion: string, data: any) => {
      logger.info(`Compilation finished for ${fileName}`)
      pluginStore.getState().setCompilationResult({
        fileName,
        success: !data.errors?.some((error: any) => error.severity === 'error'),
        data
      })
      this.emit('compilationFinished', { fileName, data })
    })

    // 监听文件变化事件
    this.on('filemanager', 'currentFileChanged', (fileName: string) => {
      logger.info(`Current file changed to ${fileName}`)
      pluginStore.getState().setCurrentFile(fileName)
      this.loadFileContent(fileName)
    })

    // 监听新文件添加
    this.on('filemanager', 'fileAdded', (fileName: string) => {
      logger.info(`File added: ${fileName}`)
    })
  }

  /**
   * 加载当前文件
   */
  private async loadCurrentFile(): Promise<void> {
    try {
      const currentFile = await this.call('filemanager', 'getCurrentFile')
      if (currentFile) {
        pluginStore.getState().setCurrentFile(currentFile)
        await this.loadFileContent(currentFile)
      }
    } catch (error) {
      logger.error('Failed to load current file:', error)
    }
  }

  /**
   * 加载文件内容
   */
  private async loadFileContent(fileName: string): Promise<void> {
    try {
      const content = await this.call('filemanager', 'readFile', fileName)
      pluginStore.getState().setFileContent(fileName, content)
    } catch (error) {
      logger.error(`Failed to load content for ${fileName}:`, error)
    }
  }

  // ===== 插件方法实现 =====

  /**
   * 获取插件版本
   */
  async getVersion(): Promise<string> {
    return '1.0.0'
  }

  /**
   * 获取插件状态
   */
  async getStatus(): Promise<any> {
    return pluginStore.getState().status
  }

  /**
   * 编译当前文件
   */
  async compile(fileName?: string): Promise<any> {
    try {
      const fileToCompile = fileName || pluginStore.getState().currentFile
      if (!fileToCompile) {
        throw new Error('No file to compile')
      }

      logger.info(`Compiling ${fileToCompile}`)
      await this.call('solidity', 'compile', fileToCompile)
      
      return { success: true, message: 'Compilation started' }
    } catch (error) {
      logger.error('Compilation failed:', error)
      throw error
    }
  }

  /**
   * 部署合约
   */
  async deploy(contractName: string, constructorArgs: any[] = []): Promise<any> {
    try {
      logger.info(`Deploying contract ${contractName}`)
      
      // 获取编译结果
      const compilationResult = pluginStore.getState().compilationResult
      if (!compilationResult?.success) {
        throw new Error('No successful compilation found')
      }

      // 这里应该实现实际的部署逻辑
      // 目前返回模拟结果
      const deploymentResult = {
        contractName,
        address: '0x' + Math.random().toString(16).substr(2, 40),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        gasUsed: Math.floor(Math.random() * 1000000)
      }

      this.emit('deploymentCompleted', deploymentResult)
      logger.info(`Contract deployed at ${deploymentResult.address}`)
      
      return deploymentResult
    } catch (error) {
      logger.error('Deployment failed:', error)
      throw error
    }
  }

  /**
   * 加密数据（Zama 集成点）
   */
  async encrypt(data: string): Promise<string> {
    try {
      logger.info('Encrypting data with Zama')
      
      // 这里应该集成 Zama 的加密逻辑
      // 目前返回模拟结果
      const encrypted = Buffer.from(data).toString('base64')
      
      this.emit('encryptionCompleted', { original: data, encrypted })
      return encrypted
    } catch (error) {
      logger.error('Encryption failed:', error)
      throw error
    }
  }

  /**
   * 解密数据（Zama 集成点）
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      logger.info('Decrypting data with Zama')
      
      // 这里应该集成 Zama 的解密逻辑
      // 目前返回模拟结果
      const decrypted = Buffer.from(encryptedData, 'base64').toString()
      
      return decrypted
    } catch (error) {
      logger.error('Decryption failed:', error)
      throw error
    }
  }

  /**
   * 获取合约 ABI
   */
  async getContractAbi(contractName: string): Promise<any[]> {
    try {
      const compilationResult = pluginStore.getState().compilationResult
      if (!compilationResult?.success || !compilationResult.data) {
        throw new Error('No compilation data available')
      }

      // 从编译结果中提取 ABI
      const contracts = compilationResult.data.contracts
      for (const fileName in contracts) {
        if (contracts[fileName][contractName]) {
          return contracts[fileName][contractName].abi
        }
      }

      throw new Error(`Contract ${contractName} not found`)
    } catch (error) {
      logger.error('Failed to get contract ABI:', error)
      throw error
    }
  }

  /**
   * 执行交易
   */
  async executeTransaction(to: string, data: string, value: string = '0'): Promise<any> {
    try {
      logger.info(`Executing transaction to ${to}`)
      
      // 这里应该实现实际的交易执行逻辑
      const transactionResult = {
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        to,
        data,
        value,
        gasUsed: Math.floor(Math.random() * 100000),
        status: 'success'
      }

      this.emit('transactionExecuted', transactionResult)
      logger.info(`Transaction executed: ${transactionResult.hash}`)
      
      return transactionResult
    } catch (error) {
      logger.error('Transaction execution failed:', error)
      throw error
    }
  }
}

// 创建插件实例
export const zamaPlugin = new ZamaPlugin()
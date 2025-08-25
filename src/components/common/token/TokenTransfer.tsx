// src/components/token/TokenTransfer.tsx (continued)
           </label>
           <input
             id="amount"
             type="number"
             value={formData.amount}
             onChange={(e) => handleInputChange('amount', e.target.value)}
             placeholder="输入转账金额"
             step="0.000001"
             min="0"
             className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
               validationErrors.amount 
                 ? 'border-red-300 focus:ring-red-500' 
                 : 'border-gray-300 focus:ring-blue-500'
             }`}
           />
           {validationErrors.amount && (
             <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
           )}
         </div>

         <button
           type="submit"
           disabled={isLoading || !formData.to.trim() || !formData.amount.trim()}
           className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
         >
           {isLoading ? <LoadingSpinner size="sm" message="转账中..." /> : '💸 发起转账'}
         </button>
       </form>

       <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
         <p>💡 提示：转账需要支付网络 Gas 费用，请确保钱包有足够的 ETH</p>
       </div>
     </div>

     <ConfirmDialog
       isOpen={showConfirm}
       title="确认转账"
       message={`确认向 ${formatAddress(formData.to)} 转账 ${formData.amount} ${tokenInfo?.symbol || 'TOKEN'} 吗？`}
       confirmText="确认转账"
       cancelText="取消"
       onConfirm={handleConfirmTransfer}
       onCancel={() => setShowConfirm(false)}
       type="warning"
     />
   </>
 );
}
import { typedAssert } from 'test-utils'
import { ethers, BigNumber } from 'ethers'

import { createNewBlockchain, deployContract } from './common'
import { Events } from '../types/Events'

describe('Events', () => {
  let contract!: Events
  let ganache: any
  beforeEach(async () => {
    const { ganache: _ganache, signer } = await createNewBlockchain()
    signer.provider.pollingInterval = 100
    ganache = _ganache
    contract = await deployContract<Events>(signer, 'Events')
  })

  afterEach(async () => {
    contract.removeAllListeners('Event1')
    ganache.close()
  })

  it('queryFilter', async () => {
    await contract.emit_event1()

    const filter = contract.filters.Event1(null, null)
    const results = await contract.queryFilter(filter)
    results.map((r) => {
      typedAssert(r.args.value1, BigNumber.from(1))
      typedAssert(r.args.value2, BigNumber.from(2))
      typedAssert(r.args[0], BigNumber.from(1))
      typedAssert(r.args[1], BigNumber.from(2))
    })
  })

  it('contract.on', async () => {
    const filter = contract.filters.Event1(null, null)
    const results = await contract.queryFilter(filter)

    contract.on(filter, (a, b, c) => {
      typedAssert(a, BigNumber.from(1))
      typedAssert(b, BigNumber.from(2))
      const args = [a, b] as [ethers.BigNumber, ethers.BigNumber] & {
        value1: ethers.BigNumber
        value2: ethers.BigNumber
      }
      args.value1 = a
      args.value2 = b
      typedAssert(c.args, args)
    })

    await contract.emit_event1()
    await new Promise((r) => setTimeout(r, 1000))
  })

  it('contract.once', async () => {
    const filter = contract.filters.Event1(null, null)
    const results = await contract.queryFilter(filter)

    contract.once(filter, (a, b, c) => {
      typedAssert(a, BigNumber.from(1))
      typedAssert(b, BigNumber.from(2))
      const args = [a, b] as [ethers.BigNumber, ethers.BigNumber] & {
        value1: ethers.BigNumber
        value2: ethers.BigNumber
      }
      args.value1 = a
      args.value2 = b
      typedAssert(c.args, args)
    })

    await contract.emit_event1()
    await new Promise((r) => setTimeout(r, 1000))
  })
})

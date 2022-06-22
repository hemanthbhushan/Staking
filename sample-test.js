const { expect } = require("chai");
const { ethers } = require("hardhat");
const { waffle } = require("hardhat");

describe("staking contract",()=>{
  let Stake;
  let stake;
  let signer1;
  let signer2;


  beforeEach(async ()=>{
    [signer1,signer2] = await ethers.getSigners();
     Stake = await ethers.getContractFactory("Staking");
     staking = await Stake.deploy({value: ethers.utils.parseEther('10')});
    await staking.deployed();

  });
  describe("constructor test",()=>{
    it("owner",async ()=>{
     
      expect(await staking.owner()).to.equal(signer1.address);

    });
    it("amount of percentage",async ()=>{
      expect(await staking.amountOfpercentage(30)).to.equal(700);
      expect(await staking.amountOfpercentage(60)).to.equal(1200);
      expect(await staking.amountOfpercentage(90)).to.equal(2400);
    });
    it("lockPeriods",async ()=>{
      expect(await staking.lockPeriods(0)).to.equal(30);
      expect(await staking.lockPeriods(1)).to.equal(60);
      expect(await staking.lockPeriods(2)).to.equal(90);

      // expect( await stake.lockPeriods)to.eql(()=>e)
    });
  });
  describe("stakeEth",()=>{
    it("transfer of ether",async ()=>{
      const provider =   waffle.provider;
      const transferAmount = ethers.utils.parseEther('2.0');
      const signerBalance = await signer1.getBalance();
      const contractBalance = await provider.getBalance(staking.address);

      const data =  { value: transferAmount };
      const transaction = await staking.connect(signer1).stakeEth(30,data);
      const receipt = await transaction.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      


      expect(
        await signer1.getBalance()
        ).to.equal(
          signerBalance.sub(transferAmount).sub(gasUsed)
          );

      expect(
        await provider.getBalance(staking.address)
        ).to.equal(
          contractBalance.add(transferAmount)
          );


    });
    it("check the positions",async ()=>{
      const provider = waffle.provider;
      const transferAmount = ethers.utils.parseEther('1.0');
     
      let position = await staking.positions(0);
      

      expect(await position.positionId).to.equal(0);
      // expect(await position.walletAddress).to.equal('0x000000000000000000000000000000000');
      expect(await position.createdDate).to.equal(0);
      expect(await position.unlockDate).to.equal(0);
      expect(await position.percentIntrest).to.equal(0);
      expect(await position.weiStaked).to.equal(0);
      expect(await position.weiIntrest).to.equal(0);
      expect(await position.open).to.equal(false);

      expect(await staking.currentPositionId()).to.equal(0);

      const data = {value : transferAmount };
      const transaction = await staking.connect(signer1).stakeEth(90,data);
      const receipt = await transaction.wait();
      //the date the block in the blockchain created using the transaction is equal to the stakeEth  created
      const block = await provider.getBlock(receipt.blockNumber);
      position = await staking.positions(0);

      expect(await position.positionId).to.equal(0);
      expect(await position.walletAddress).to.equal(signer1.address);
      expect(await position.createdDate).to.equal(block.timestamp);
      expect(await position.unlockDate).to.equal(block.timestamp + (86400 * 90));
      expect(await position.percentIntrest).to.equal(2400);
      expect(await position.weiStaked).to.equal(transferAmount);
      //ethers.BigNumber.from(transferAmount) it is converting transferamount into bigamount as it is in wei
      expect(await position.weiIntrest).to.equal(ethers.BigNumber.from(transferAmount).mul(2400).div(10000));
      expect(await position.open).to.equal(true);
      
      expect(await staking.currentPositionId()).to.equal(1);

    });

    it("position by address ",async ()=>{
     
      const transferAmount = ethers.utils.parseEther('10');
      const data = {value: transferAmount};
       await staking.connect(signer1).stakeEth(60,data);
       await staking.connect(signer2).stakeEth(60,data);
       await staking.connect(signer2).stakeEth(60,data);


      //syntax for mapping(address=> uint[]) position by addess 
      expect(await staking.positionIdByAddress(signer1.address,0)).to.equal(0);
      expect(await staking.positionIdByAddress(signer2.address,0)).to.equal(1);
      expect(await staking.positionIdByAddress(signer2.address,1)).to.equal(2);
  });

  });

  describe("indidual functions",()=>{
   describe("modify lock up",()=>{
    it("owner modifying existing lockupperiod",async()=>{
      const transferAmount = ethers.utils.parseEther('1.0');
     const data = {value: transferAmount};

     await staking.connect(signer1).stakeEth(30,data);

    await staking.modifyLockUpPeriods(30,100);
    
    expect(await staking.amountOfpercentage(30)).to.equal(100);
    expect(await staking.lockPeriods(0)).to.equal(30);


    });
     it("owner modifying new lockup period ",async ()=>{
      const transferAmount = ethers.utils.parseEther('1.0');
     const data = {value: transferAmount};

     await staking.connect(signer1).stakeEth(30,data);

    await staking.modifyLockUpPeriods(110,2600);
    
    expect(await staking.amountOfpercentage(110)).to.equal(2600);
    
     });
     it("if it is not a owner",async ()=>{
      const transferAmount = ethers.utils.parseEther('1.0');
      const data = {value: transferAmount};

      await staking.connect(signer2).stakeEth(30,data);
      await staking.modifyLockUpPeriods(110,2600);
     expect(staking.amountOfpercentage(110)).to.be.revertedWith("only owner can change staking Period");

     });
  });
  describe("lock period",()=>{
    it("gets Lock up periods",async ()=>{
      const lockPeriods = await staking.getLockUpPeriods();
      expect(await 
        lockPeriods.map(v=>Number(v._hex))
        
        ).to.eql(
          [30,60,90]);
  
    });
  });
  describe("get Intrest rates",()=>{
    it("returns all intrest rates",async()=>{
      const getIntrest = await staking.getIntrestRate(30);
      expect(getIntrest).to.equal(700);
    });
});
// describe("get position by id",()=>{
//   it("returns position by Id",async ()=>{
//     const transferAmount


//   });

// });


});

 
  

});
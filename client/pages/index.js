import Head from "next/head";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Germania_One, Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import { NFT_CONTRACT_ADDRESS, NFT_COLLECTION_ABI } from "@/constants";
import { STRING_LITERAL_DROP_BUNDLE } from "next/dist/shared/lib/constants";
import { render } from "react-dom";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);

  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef();

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSinger(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        signer
      );

      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(true);
      window.alert("you successfully minted a crypto dev");
    } catch (error) {
      console.log(error.message);
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSinger(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        signer
      );
      const tx = await nftContract.mint({ value: utils.parseEther("0.01") });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("you successfully minted a crypto dev");
    } catch (error) {
      console.error(error.message);
    }
  };
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSinger();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        provider
      );
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      console.log(_owner);
      const signer = await getProviderOrSinger(true);
      // We will get the signer now to extract the address of the currently connected MetaMask account

      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const gettokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSinger();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        provider
      );

      const _tokenId = await nftContract.tokenIds();
      setTokenIdsMinted(_tokenId.toString());
    } catch (error) {
      console.error(error.message);
    }
  };

  const startPreSale = async () => {
    try {
      const signer = await getProviderOrSinger(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        signer
      );
      const txn = await nftContract.startPresale();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await checkPresaleStarted();
      setPresaleStarted(true);
    } catch (error) {
      console.error(error.message);
    }
  };
  const checkPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSinger();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        provider
      );
      const _presaleEnded = await nftContract.presaleEnded();

      // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  };

  const checkPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSinger();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_COLLECTION_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      if (!isPresaleStarted) {
        await getOwner();
      }
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSinger();
      setWalletConnected(true);
    } catch (error) {
      console.error(error.message);
    }

    // to connect the wallet we need to gain access to provider signer from wallet
  };
  const getProviderOrSinger = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // If user is not connected to the Goerli network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 11155111) {
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.error(error.message);
    }
  };
  const onPageLoad = async () => {
    await connectWallet();

    const presaleStarted = await checkPresaleStarted();
    if (presaleStarted) {
      await checkPresaleEnded();
    }
    await gettokenIdsMinted();
    //track in real time the numbr of minted NFTs
    setInterval(async () => {
      await gettokenIdsMinted();
    }, 5 * 1000);

    setInterval(async () => {
      const presaleStarted = await checkPresaleStarted();
      if (presaleStarted) {
        await checkPresaleEnded();
      }
    }, 5 * 1000);
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad();
      //we can set interval to check weather
      //presale is started or not for every 5 second
    }
  }, []);

  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          connect your wallet
        </button>
      );
    }
    if (loading) {
      return <span className={styles.description}>Loading...</span>;
    }
    if (isOwner && !presaleStarted) {
      //render a button to start the preseale
      return (
        <button onClick={startPreSale} className={styles.button}>
          Start Presale
        </button>
      );
    }
    if (!presaleStarted) {
      //just saying that presale hasn't started yet
      return (
        <div>
          <span className={styles.description}>
            Presale has not started yet. Come back later!
          </span>
        </div>
      );
    }
    if (presaleStarted && !presaleEnded) {
      //allow useres to mint in presale
      //they need to be in whilist for this to work
      return (
        <div>
          <span className={styles.description}>
            presale has started if your name address in whitelist , you can mint
            a cryptoDev!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            presale Mint
          </button>
        </div>
      );
    }
    if (presaleStarted && presaleEnded) {
      //allow useres to mint in presale
      //they need to be in whilist for this to work
      return (
        <div>
          <span className={styles.description}>
            presale has started if your name address in whitelist , you can mint
            a cryptoDev!
          </span>
          <button className={styles.button} onClick={publicMint}>
            public Mint 🚀
          </button>
        </div>
      );
    }
    if (presaleEnded) {
      return (
        <div>
          <span>
            Presale has ended. You can mint a CryptoDev in pubilc sale, if any
            remain
          </span>
          <button className={styles.button}>presale Mint</button>
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>crypto devs nft</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderBody()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>{" "}
    </div>
  );
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//base uri : https://nft-collection-pi-sepia.vercel.app/api/

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  const name = `Crypto dev #${tokenId}`;
  const description = "Crypto dev is an NFT Collection web3 developers";
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${
    Number(tokenId) - 1
  }.svg`;
  res.status(200).json({
    name: name,
    description: description,
    image: image,
  });
}

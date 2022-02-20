import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { create, CID } from "ipfs-http-client";
import TicketABI from "../assets/TicketABI.json";

import "../styles/mint-tickets.scss";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

export const tickets = [
  {
    type: "General Admission",
    price: 15.0,
    amountRemaining: 0,
  },
  {
    type: "General Admission 2",
    price: 17.0,
    amountRemaining: 150,
  },
  {
    type: "VIP",
    price: 35.0,
    amountRemaining: 30,
  },
  {
    type: "Backstage Pass",
    price: 150.0,
    amountRemaining: 3,
  },
];

const EventMint = () => {
  const { address: eventAddress } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState<FileList | null>(null);
  const { library } = useWeb3React();
  const signer = library.getSigner();

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    setImage(event.target.files);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    // ipfs upload
    if (image === null) {
      // handle no image here
      console.log("no image");
      return;
    }

    // Read the file uploaded to get image dimensions and type
    var imageData = new Image();
    var imageType = "";
    var fileReader = new FileReader();

    fileReader.onload = async () => {
      imageData.src = fileReader.result as string;

      async function getImageBlob(imageUrl: string) {
        const response = await fetch(imageUrl);
        return response.blob();
      }

      const imageBlob = await getImageBlob(fileReader.result as string);
      imageType = imageBlob.type;
    };
    fileReader.readAsDataURL(image[0]);

    const client = create({ url: "https://ipfs.infura.io:5001" });
    const { cid: imageCid } = await client.add(image![0]);

    // ipfs hash for metadata
    const metadata = {
      name: type,
      description: desc,
      image: {
        url: {
          ORIGINAL: `ipfs://ipfs/${imageCid}`,
        },
        meta: {
          ORIGINAL: {
            type: imageType,
            width: imageData.width,
            height: imageData.height,
          },
        },
      },
    };

    const { cid: metadataCid } = await client.add(JSON.stringify(metadata));
    const metadataUri = `ipfs://ipfs/${metadataCid}`;

    async function mintTickets() {
      const loadContract = async () => {
        const contractShape = new ethers.Contract(
          "0xb628a2038bb4bf52486ffdd8dd2eb07e73dda5da",
          TicketABI,
          library
        );
        var contract = contractShape.connect(signer);
        console.log(contract);
        var res = await contract.mintGA(
          eventAddress,
          metadataUri,
          parseInt(amount)
        );
        var rec = await res.wait();
        console.log(res);
        console.log(rec);
      };
      await loadContract();
      // needs to be locally compiled bytecode for some reason
      // var event = new ethers.ContractFactory(EventABI, BC, signer);
      // var res = await event.deploy(addr, title, metadataUri);
      // await axios.post(
      //   "https://beta-even-ft-backend.onrender.com/api/v1/event/create",
      //   { address: res.address, ownerAddress: addr }
      // );
    }
    mintTickets();
  };

  return (
    <main className="mint-tickets">
      <span className="close" onClick={() => navigate(-1)}></span>
      <h1>Mint Tickets</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="type">Type</label>
        <input
          type="text"
          id="type"
          name="type"
          placeholder="Ticket Type"
          autoFocus
          maxLength={40}
          onChange={(e) => setType(e.target.value)}
        />
        <label htmlFor="description">Ticket Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Ticket Description"
          rows={3}
          maxLength={140}
          onChange={(e) => setDesc(e.target.value)}
        />
        <label htmlFor="amount">Ticket Amount</label>
        <textarea
          id="amount"
          name="amount"
          placeholder="Ticket amount"
          rows={1}
          maxLength={3}
          onChange={(e) => setAmount(e.target.value)}
        />
        <label htmlFor="image" className="label-show">
          Ticket Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          maxLength={40}
          accept=".png,.jpg,.jpeg"
          title="Upload ticket image"
          onChange={onImageChange}
        />
        <button type="submit">Mint</button>
      </form>
    </main>
  );
};

export default EventMint;

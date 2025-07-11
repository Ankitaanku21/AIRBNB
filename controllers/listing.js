import Listing from "../models/listing.js";

export async function index(req, res){
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

export function renderNewForm(req, res){
    res.render("listings/new.ejs");
};

export async function showListing(req, res){
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing you are requested doesn't exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

export async function createListing(req, res){
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

export async function renderEditForm(req, res){
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id);
    if(!listing){
        req.flash("error", "Listing you are requested doesn't exist");
        res.redirect("/listings");
    }

    let OriginalImageUrl = listing.image.url;
    OriginalImageUrl = OriginalImageUrl.replace("/upload", "/upload/h_300,w_250")
    res.render("listings/edit.ejs", { listing, OriginalImageUrl });
}

export async function updateListing(req, res){
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing });
    // if (req.file) {
    //     listing.image = {
    //       url: req.file.path,
    //       filename: req.file.filename
    //     };
    //   }
      
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    // Find the existing listing
    const existingListing = await Listing.findById(id);

    // If no new image is submitted, preserve the existing one
    if (!req.body.listing.image || !req.body.listing.image.url) {
        req.body.listing.image = existingListing.image;
    }

    // Update the listing with preserved or updated image
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });    
    req.flash("success", "Listing upadated!");
    res.redirect(`/listings/${id}`);
};

export async function destroyListing(req, res) {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
}

//This function is to render the listings belonged to that category
export const getCategory=async(req,res)=>{
    let {icon}=req.query;
    console.log(icon);
    let listing=await Listing.find({category:icon});
    console.log(listing);
    if(listing.length>0){
        res.render("listings/iconDetail.ejs",{listing,icon});
    }else{
        res.render("/listings")
    }
}

export default {
    index,
    renderNewForm,
    createListing,
    showListing,
    renderEditForm,
    updateListing,
    destroyListing,
    getCategory,
  };
  

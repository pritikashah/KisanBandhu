const mongoose = require("mongoose");

const Scheme = require("../models/Scheme");

const cleanApplicationUrl = (applicationUrl) => {
  if (
    applicationUrl === undefined ||
    applicationUrl === null
  ) {
    return undefined;
  }

  let url = String(applicationUrl).trim();

  const markdownMatch = url.match(
    /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/
  );

  if (markdownMatch) {
    url = markdownMatch[2];
  }

  return url;
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter(
      (tag) =>
        typeof tag === "string" &&
        tag.trim().length > 0
    )
    .map((tag) =>
      tag.trim().toLowerCase()
    );
};

const createScheme = async (req, res) => {
  try {
    const {
      title,
      summary,
      eligibility,
      benefits,
      applicationUrl,
      state,
      tags,
    } = req.body;

    if (
      !title ||
      !summary ||
      !eligibility ||
      !benefits
    ) {
      return res.status(400).json({
        message:
          "Title, summary, eligibility, and benefits are required.",
      });
    }

    if (
      applicationUrl !== undefined &&
      applicationUrl !== null &&
      typeof applicationUrl !== "string"
    ) {
      return res.status(400).json({
        message:
          "Application URL must be a string.",
      });
    }

    if (
      state !== undefined &&
      state !== null &&
      typeof state !== "string"
    ) {
      return res.status(400).json({
        message: "State must be a string.",
      });
    }

    if (
      tags !== undefined &&
      !Array.isArray(tags)
    ) {
      return res.status(400).json({
        message: "Tags must be an array.",
      });
    }

    const cleanedApplicationUrl =
      cleanApplicationUrl(applicationUrl);

    const cleanedTags = normalizeTags(tags);

    const scheme = await Scheme.create({
      title: title.trim(),
      summary: summary.trim(),
      eligibility: eligibility.trim(),
      benefits: benefits.trim(),
      applicationUrl: cleanedApplicationUrl,
      state:
        state && state.trim()
          ? state.trim()
          : null,
      tags: cleanedTags,
      isActive: true,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    return res.status(201).json({
      message:
        "Government scheme created successfully.",
      scheme,
    });
  } catch (error) {
    console.error(
      "Create scheme error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating government scheme.",
    });
  }
};

const getSchemes = async (req, res) => {
  try {
    const {
      state,
      active,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (state) {
      filter.$or = [
        {
          state: state.trim(),
        },
        {
          state: null,
        },
      ];
    }

    if (active !== undefined) {
      if (
        active !== "true" &&
        active !== "false"
      ) {
        return res.status(400).json({
          message:
            "Active filter must be true or false.",
        });
      }

      filter.isActive = active === "true";
    }

    const schemes = await Scheme.find(filter)
      .populate(
        "createdBy updatedBy",
        "name email role"
      )
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      message:
        "Government schemes fetched successfully.",
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    console.error(
      "Get schemes error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching government schemes.",
    });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid scheme ID.",
      });
    }

    const scheme = await Scheme.findOne({
      _id: id,
      isActive: true,
    }).populate(
      "createdBy updatedBy",
      "name email role"
    );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Government scheme not found.",
      });
    }

    return res.status(200).json({
      message:
        "Government scheme fetched successfully.",
      scheme,
    });
  } catch (error) {
    console.error(
      "Get scheme by ID error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching government scheme.",
    });
  }
};

const searchSchemes = async (req, res) => {
  try {
    const {
      keyword,
      state,
    } = req.query;

    if (
      !keyword ||
      !keyword.trim()
    ) {
      return res.status(400).json({
        message:
          "Search keyword is required.",
      });
    }

    const filter = {
      isActive: true,
      $text: {
        $search: keyword.trim(),
      },
    };

    if (state) {
      filter.$or = [
        {
          state: state.trim(),
        },
        {
          state: null,
        },
      ];
    }

    const schemes = await Scheme.find(
      filter,
      {
        score: {
          $meta: "textScore",
        },
        title: 1,
        summary: 1,
        eligibility: 1,
        benefits: 1,
        applicationUrl: 1,
        state: 1,
        tags: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    ).sort({
      score: {
        $meta: "textScore",
      },
    });

    return res.status(200).json({
      message:
        "Government scheme search completed successfully.",
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    console.error(
      "Search schemes error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while searching government schemes.",
    });
  }
};

const updateScheme = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid scheme ID.",
      });
    }

    const {
      title,
      summary,
      eligibility,
      benefits,
      applicationUrl,
      state,
      tags,
      isActive,
    } = req.body;

    if (
      !title ||
      !summary ||
      !eligibility ||
      !benefits
    ) {
      return res.status(400).json({
        message:
          "Title, summary, eligibility, and benefits are required.",
      });
    }

    if (
      applicationUrl !== undefined &&
      applicationUrl !== null &&
      typeof applicationUrl !== "string"
    ) {
      return res.status(400).json({
        message:
          "Application URL must be a string.",
      });
    }

    if (
      state !== undefined &&
      state !== null &&
      typeof state !== "string"
    ) {
      return res.status(400).json({
        message: "State must be a string.",
      });
    }

    if (
      tags !== undefined &&
      !Array.isArray(tags)
    ) {
      return res.status(400).json({
        message: "Tags must be an array.",
      });
    }

    if (
      isActive !== undefined &&
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        message:
          "isActive must be true or false.",
      });
    }

    const cleanedApplicationUrl =
      cleanApplicationUrl(applicationUrl);

    const cleanedTags = normalizeTags(tags);

    const scheme =
      await Scheme.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            title: title.trim(),
            summary: summary.trim(),
            eligibility: eligibility.trim(),
            benefits: benefits.trim(),
            applicationUrl:
              cleanedApplicationUrl,
            state:
              state && state.trim()
                ? state.trim()
                : null,
            tags: cleanedTags,
            isActive:
              isActive === undefined
                ? true
                : isActive,
            updatedBy: req.user.userId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Government scheme not found.",
      });
    }

    return res.status(200).json({
      message:
        "Government scheme updated successfully.",
      scheme,
    });
  } catch (error) {
    console.error(
      "Update scheme error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating government scheme.",
    });
  }
};

const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid scheme ID.",
      });
    }

    const scheme =
      await Scheme.findOneAndDelete({
        _id: id,
      });

    if (!scheme) {
      return res.status(404).json({
        message:
          "Government scheme not found.",
      });
    }

    return res.status(200).json({
      message:
        "Government scheme deleted successfully.",
      schemeId: scheme._id,
    });
  } catch (error) {
    console.error(
      "Delete scheme error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting government scheme.",
    });
  }
};

module.exports = {
  createScheme,
  getSchemes,
  getSchemeById,
  searchSchemes,
  updateScheme,
  deleteScheme,
};
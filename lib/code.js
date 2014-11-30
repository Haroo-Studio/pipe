exports.token = {
    database: {
        code: 10,
        msg: {
            en: "database error"
        }
    },
    allowed: {
        code: 11,
        msg: {
            en: "this request will be allowed"
        }
    },
    blocked: {
        code: 12,
        msg: {
            en: "this request will be not allowed"
        }
    },
    validate: {
        code: 13,
        msg: {
            en: "this token validate"
        }
    },
    extended: {
        code: 14,
        msg: {
            en: "this token validate and extended expire date"
        }
    },
    expired: {
        code: 15,
        msg: {
            en: "this token expired"
        }
    },
    removed: {
        code: 16,
        msg: {
            en: "this token removed successfully"
        }
    },
    no_exist: {
        code: 17,
        msg: {
            en: "no exist access token"
        }
    }
};

exports.document = {
    public: {
        done: {
            code: 10,
            msg: {
                en: "public url generated"
            }
        },
        validation: {
            code: 11,
            msg: {
                en: "common validation error"
            }
        },
        database: {
            code: 12,
            msg: {
                en: "database error"
            }
        }
    }
};

exports.account = {
    haroo_id: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        reserved: {
            code: 11,
            msg: {
                en: "already exist haroo_id"
            }
        },
        invalid: {
            code: 10,
            msg: {
                en: "invalid haroo_id"
            }
        },
        success: {
            code: 15,
            msg: {
                en: "good to go"
            }
        },
        expired: {
            code: 14,
            msg: {
                en: "access token expired"
            }
        },
        database: {
            code: 12,
            msg: {
                en: "database error"
            }
        }
    },
    token: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        allowed: {
            code: 10,
            msg: {
                en: "access token allowed"
            }
        },
        denied: {
            code: 11,
            msg: {
                en: "access token denied cause your token maybe mismatched or expired"
            }
        },
        no_exist: {
            code: 12,
            msg: {
                en: "no exist access token"
            }
        },
        expired: {
            code: 14,
            msg: {
                en: "exist token expired need to new access token for next access"
            }
        }
    },
    create: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        duplication: {
            code: 11,
            msg: {
                en: "already exist account"
            }
        },
        database: {
            code: 12,
            msg: {
                en: "database error"
            }
        },
        done: {
            code: 10,
            msg: {
                en: "account saved"
            }
        }
    },
    login: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        validation_for_ext: {
            code: 14,
            msg: {
                en: "common validation error for external"
            }
        },
        no_exist: {
            code: 11,
            msg: {
                en: "no exist account"
            }
        },
        done: {
            code: 10,
            msg: {
                en: "account retrieved"
            }
        }
    },
    dismiss: {
        database: {
            code: 14,
            msg: {
                en: "database error"
            }
        },
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        no_exist: {
            code: 11,
            msg: {
                en: "no exist account"
            }
        },
        done: {
            code: 10,
            msg: {
                en: "account dismissed"
            }
        }
    },
    update: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        database: {
            code: 12,
            msg: {
                en: "database error"
            }
        },
        no_exist: {
            code: 11,
            msg: {
                en: "no exist account or password incorrect"
            }
        },
        done: {
            code: 10,
            msg: {
                en: "account updated"
            }
        }
    },
    remove: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        database: {
            code: 12,
            msg: {
                en: "database error"
            }
        },
        token_expired: {
            code: 14,
            msg: {
                en: "invalid access token exist or token expired"
            }
        },
        no_exist: {
            code: 11,
            msg: {
                en: "no exist account"
            }
        },
        done: {
            code: 10,
            msg: {
                en: "account removed"
            }
        }
    },
    password: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        send_mail: {
            code: 10,
            msg: {
                en: "reset password mail sent"
            }
        },
        no_exist: {
            code: 12,
            msg: {
                en: "no exist account"
            }
        },
        database: {
            code: 11,
            msg: {
                en: "database error"
            }
        }
    },
    external: {
        validation: {
            code: 13,
            msg: {
                en: "common validation error"
            }
        },
        link: {
            code: 12,
            msg: {
                en: "link process done"
            }
        },
        unlink: {
            code: 11,
            msg: {
                en: "unlink process done"
            }
        }
    }

};

exports.token = {
    database: {
        code: 0,
        msg: {
            en: "database error"
        }
    },
    allowed: {
        code: 1,
        msg: {
            en: "this request will be allowed"
        }
    },
    blocked: {
        code: 2,
        msg: {
            en: "this request will be not allowed"
        }
    },
    validate: {
        code: 3,
        msg: {
            en: "this token validate"
        }
    },
    extended: {
        code: 4,
        msg: {
            en: "this token validate and extended expire date"
        }
    },
    expired: {
        code: 5,
        msg: {
            en: "this token expired"
        }
    },
    removed: {
        code: 6,
        msg: {
            en: "this token removed successfully"
        }
    },
    no_exist: {
        code: 7,
        msg: {
            en: "no exist access token"
        }
    }
};

exports.account = {
    haroo_id: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        reserved: {
            code: 1,
            msg: {
                en: "already exist haroo_id"
            }
        },
        invalid: {
            code: 0,
            msg: {
                en: "invalid haroo_id"
            }
        },
        success: {
            code: 5,
            msg: {
                en: "good to go"
            }
        },
        expired: {
            code: 4,
            msg: {
                en: "access token expired"
            }
        },
        database: {
            code: 2,
            msg: {
                en: "database error"
            }
        }
    },
    token: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        allowed: {
            code: 0,
            msg: {
                en: "access token allowed"
            }
        },
        denied: {
            code: 1,
            msg: {
                en: "access token denied cause your token maybe mismatched or expired"
            }
        },
        no_exist: {
            code: 2,
            msg: {
                en: "no exist access token"
            }
        },
        expired: {
            code: 4,
            msg: {
                en: "exist token expired need to new access token for next access"
            }
        }
    },
    create: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        duplication: {
            code: 1,
            msg: {
                en: "already exist account"
            }
        },
        database: {
            code: 2,
            msg: {
                en: "database error"
            }
        },
        done: {
            code: 0,
            msg: {
                en: "account saved"
            }
        }
    },
    login: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        validation_for_ext: {
            code: 4,
            msg: {
                en: "common validation error for external"
            }
        },
        no_exist: {
            code: 1,
            msg: {
                en: "no exist account"
            }
        },
        done: {
            code: 0,
            msg: {
                en: "account retrieved"
            }
        }
    },
    dismiss: {
        database: {
            code: 4,
            msg: {
                en: "database error"
            }
        },
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        no_exist: {
            code: 1,
            msg: {
                en: "no exist account"
            }
        },
        done: {
            code: 0,
            msg: {
                en: "account dismissed"
            }
        }
    },
    update: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        database: {
            code: 2,
            msg: {
                en: "database error"
            }
        },
        no_exist: {
            code: 1,
            msg: {
                en: "no exist account or password incorrect"
            }
        },
        done: {
            code: 0,
            msg: {
                en: "account updated"
            }
        }
    },
    remove: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        database: {
            code: 2,
            msg: {
                en: "database error"
            }
        },
        token_expired: {
            code: 4,
            msg: {
                en: "invalid access token exist or token expired"
            }
        },
        no_exist: {
            code: 1,
            msg: {
                en: "no exist account"
            }
        },
        done: {
            code: 0,
            msg: {
                en: "account removed"
            }
        }
    },
    password: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        send_mail: {
            code: 0,
            msg: {
                en: "reset password mail sent"
            }
        },
        no_exist: {
            code: 2,
            msg: {
                en: "no exist account"
            }
        },
        database: {
            code: 1,
            msg: {
                en: "database error"
            }
        }
    },
    external: {
        validation: {
            code: 3,
            msg: {
                en: "common validation error"
            }
        },
        link: {
            code: 0,
            msg: {
                en: "link process done"
            }
        },
        unlink: {
            code: 0,
            msg: {
                en: "unlink process done"
            }
        }
    }

};

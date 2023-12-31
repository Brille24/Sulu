<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\CategoryBundle\Category;

use Sulu\Bundle\CategoryBundle\Entity\CategoryInterface;
use Sulu\Bundle\CategoryBundle\Entity\KeywordInterface;

/**
 * Manages keyword for categories.
 */
interface KeywordManagerInterface
{
    public const FORCE_OVERWRITE = 'overwrite';

    public const FORCE_DETACH = 'detach';

    public const FORCE_MERGE = 'merge';

    /**
     * Add given keyword to the category.
     *
     * @param string $force
     *
     * @return KeywordInterface
     */
    public function save(KeywordInterface $keyword, CategoryInterface $category, $force = null);

    /**
     * Removes keyword from given category.
     *
     * @return bool true if keyword is deleted completely from the database otherwise only from the category
     */
    public function delete(KeywordInterface $keyword, CategoryInterface $category);
}
